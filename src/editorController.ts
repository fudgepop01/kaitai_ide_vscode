'use strict';

import * as vscode from 'vscode';
import * as KaitaiStream from 'kaitai-struct/KaitaiStream';
import * as KaitaiCompiler from 'kaitai-struct-compiler';
import { safeLoad as safeLoadYaml } from 'js-yaml';

import { join as joinPath } from 'path';
import { readFileSync, writeFileSync } from 'fs';

import { analyzeStructure } from './util/regionAnalysis';
import { KSExplorer } from './KSExplorerController';
import supportedLangs from './util/supportedLangs';
import { inspect } from 'util';



interface ISequence {
  start: number;
  end: number;
  offset: number;
  contents: ISequence | number | string
}

const namespace = "kaitaiStruct";

const eager = true;

export default class editor implements vscode.Disposable {
  public currentFile: Buffer;
  public ksyFile: vscode.FileStat;
  public compiledKsy: string;
  public panel: vscode.WebviewPanel;
  public tree: KSExplorer;

  public context: vscode.ExtensionContext;
  public commands: vscode.Disposable[] = [];
  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    // registering commands
    const registerCommand = vscode.commands.registerCommand;
    this.commands.push(...[
      registerCommand(`${namespace}.openHexEditor`, this.onOpenHexEditor.bind(this)),
      registerCommand(`${namespace}.openFileAsHex`, this.onOpenFileAsHex.bind(this)),
      registerCommand(`${namespace}.compileAndExamine`, this.onCompileAndExamine.bind(this)),
      registerCommand(`${namespace}.jumpToChunk`, (start, end) => this.onJumpToChunk(start, end - 1)),
      registerCommand(`${namespace}.compileKsy`, (Uri) => this.onCompileToTarget(Uri))
    ]);
  }

  // -------------------------------------------
  //  Helpers
  // -------------------------------------------
  private generateRegions(ksyOutput: any) {
    console.log(ksyOutput);
    const analyzed = analyzeStructure(ksyOutput)
    const regions = analyzed.regionData;
    // console.log(analyzed.fullData);
    const tree = new KSExplorer(this.context, analyzed.fullData);
    this.tree = tree;
    // console.log(tree);
    this.setRegions(regions);

  }

  // -------------------------------------------
  //  Post Message to Webview
  // -------------------------------------------
  private setRegions(regionData: any) {
    const regionB64 = Buffer.from(JSON.stringify(regionData)).toString("base64");
    this.panel.webview.postMessage({
      command: 'updateRegions',
      regionB64
    })
  }

  private setLocation(start: number, end: number) {
    this.panel.webview.postMessage({
      command: 'jumpTo',
      start,
      end
    })
  }

  // -------------------------------------------
  //  Webview Message Handlers
  // -------------------------------------------
  private handleHexCursorChanged(cursor: number) {
    console.log("cursor changed: " + cursor);
  }

  // -------------------------------------------
  //  Command Handlers
  // -------------------------------------------
  private onOpenHexEditor() {
    if (this.panel) return;
    const panel = vscode.window.createWebviewPanel(
      'fudgedit',
      'kaitai struct debugger',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(joinPath(this.context.extensionPath, 'node_modules/fudgedit/dist'))
        ],
        retainContextWhenHidden: true
      }
    );

    const rawhtml = readFileSync(joinPath(this.context.extensionPath, 'src', 'webview.html'), 'utf8');
    panel.webview.html = rawhtml.replace(/{{EXTPATH}}/g, this.context.extensionPath);
    panel.onDidDispose(() => {
      this.panel = null;
      if (this.tree) {
        this.tree.dispose();
        this.tree = null;
      }
    });
    this.panel = panel;

    // recieving messages
    this.panel.webview.onDidReceiveMessage((message: {event: string, args: any}) => {
      switch(message.event) {
        case 'hexCursorChanged': this.handleHexCursorChanged(message.args); break;
      }
    })
  }

  private onOpenFileAsHex(args: vscode.Uri) {
    if (!this.panel) {
      this.onOpenHexEditor();
      if (!this.panel.visible) this.panel.reveal();
    }
    const fileBuffer = readFileSync(args.fsPath);
    this.currentFile = fileBuffer;
    const payload = fileBuffer.toString('base64');
    this.panel.webview.postMessage({
      command: 'openFile',
      file: {
        bits: payload,
        name: 'derp'
      }
    })
  }

  private async onCompileToTarget(args: vscode.Uri) {
    if (!args.fsPath.endsWith(".ksy")) throw new Error("the specified file is not a ksy file");

    const rawKsy = readFileSync(args.fsPath, 'utf8');
    const parsed = safeLoadYaml(rawKsy);
    const compiler = new KaitaiCompiler();

    vscode.window.showInformationMessage('choose a language');
    const language = await vscode.window.showQuickPick(supportedLangs, {
      placeHolder: 'javascript',
    });
    vscode.window.showInformationMessage('enable debug mode?')
    const debug = await vscode.window.showQuickPick(['true', 'false'], {
      placeHolder: 'false'
    });

    let compiled;
    try {
      compiled = await compiler.compile(language, parsed, null, debug === 'true');
    } catch(e) {
      console.log(e);
      vscode.window.showErrorMessage(`${e.s$1}: ${e.e$1.s$1} \ntrace:\n${e.stackTrace$1}`);
      return;
    }

    for (const [name, content] of Object.entries(compiled)){
      writeFileSync(args.path.substring(0, args.fsPath.lastIndexOf('/') + 1) + name, content, 'utf8');
    }
  }

  private async onCompileAndExamine(args: vscode.Uri) {
    if (!args.fsPath.endsWith(".ksy")) throw new Error("the specified file is not a ksy file");

    const rawKsy = readFileSync(args.fsPath, 'utf8');
    const parsed = safeLoadYaml(rawKsy);
    const compiler = new KaitaiCompiler();
    const debug = true;

    const compiled = await compiler.compile('javascript', parsed, null, debug);



    const fileName = Object.keys(compiled)[0];
    let fileData: string = compiled[fileName];

    const className = fileName.substring(0, fileName.length - 3);
    let parseFunction: (KaitaiStream: KaitaiStream) => any;

    eval(`
      function workDamnit(KaitaiStream) {
        ${fileData.substring(fileData.indexOf(`var ${className}`), fileData.lastIndexOf(`return ${className}`))}
        return ${className}
      }
      parseFunction = workDamnit;
    `);

    const out = new (parseFunction(KaitaiStream))(new KaitaiStream(this.currentFile, 0));
    await out._root._read();

    this.generateRegions(out);
  }

  private onJumpToChunk(start, end) {
    this.setLocation(start, end);
  }

  public dispose() {}
}