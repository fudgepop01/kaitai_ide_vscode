'use strict';

import * as vscode from 'vscode';
import * as KaitaiStream from 'kaitai-struct/KaitaiStream';
import * as KaitaiCompiler from './compiler/kaitai-struct-compiler.js';
import { safeLoad as safeLoadYaml } from 'js-yaml';

import { join as joinPath } from 'path';
import { platform } from 'os';
import { readFileSync, writeFileSync } from 'fs';

import { analyzeStructure, opts } from './util/regionAnalysis';
import { KSExplorer } from './KSExplorerController';
import supportedLangs from './util/supportedLangs';

const namespace = "kaitaiStruct";

export default class editor implements vscode.Disposable {
  public currentFile: Buffer;
  public ksyFile: vscode.FileStat;
  public compiledKsy: string;
  public panel: vscode.WebviewPanel;
  public tree: KSExplorer;
  public loadedPaths: string[] = [];

  public autoChunkOnSelect: boolean = false;

  public context: vscode.ExtensionContext;
  public commands: vscode.Disposable[] = [];
  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    // registering commands
    const registerCommand = vscode.commands.registerCommand;
    this.commands.push(...[
      registerCommand(`${namespace}.openHexEditor`, () => this.onOpenHexEditor()),
      registerCommand(`${namespace}.openFileAsHex`, this.onOpenFileAsHex.bind(this)),
      registerCommand(`${namespace}.compileAndExamine`, this.onCompileAndExamine.bind(this)),
      registerCommand(`${namespace}.jumpToChunk`, (start, end) => this.onJumpToChunk(start, end - 1)),
      registerCommand(`${namespace}.compileKsy`, (Uri) => this.onCompileToTarget(Uri))
    ]);

    opts.callback = (regions) => this.setRegions(regions);
  }

  // -------------------------------------------
  //  Helpers
  // -------------------------------------------
  private generateRegions(ksyOutput: any) {
    console.log(ksyOutput);
    try {
      analyzeStructure(ksyOutput);
    } catch(e) {
      console.error(e)
    }
    const analyzed = analyzeStructure(ksyOutput)
    const regions = analyzed.regionData;
    console.log(analyzed.fullData);
    const tree = new KSExplorer(this.context, analyzed.fullData);
    this.tree = tree;
    // console.log(tree);
    this.setRegions(regions);

  }

  private doFullLoad(path: string) {
    const rawKsy = readFileSync(path, 'utf8');
    try {
      safeLoadYaml(rawKsy);
    } catch (e) {
      console.error(e);
      vscode.window.showErrorMessage(e);
    }
    const parsedYaml = safeLoadYaml(rawKsy);

    if (parsedYaml.meta.imports) {
      if (!parsedYaml.types) parsedYaml.types = {};

      for (const rawPath of parsedYaml.meta.imports as string[]) {

        const importPath = (platform() === "win32") ?
          joinPath(path.substring(0, path.lastIndexOf('\\')), ...(rawPath + '.ksy').split("/")).normalize():
          joinPath(path.substring(0, path.lastIndexOf('/')), ...(rawPath + '.ksy').split("/")).normalize();
        if (this.loadedPaths.includes(importPath)) continue;
        else this.loadedPaths.push(importPath);

        let toAppend = this.doFullLoad(importPath);

        parsedYaml.types[toAppend.meta.id] = toAppend;
      }

      delete parsedYaml.meta.imports;
    }

    return parsedYaml;
  }

  // -------------------------------------------
  //  Post Message to Webview
  // -------------------------------------------
  private setRegions(regionData: any) {
    opts.currentRegions = regionData;
    const regionB64 = Buffer.from(JSON.stringify(regionData)).toString("base64");
    this.panel.webview.postMessage({
      command: 'updateRegions',
      regionB64
    })
  }

  private setLocation(start: number, end: number) {
    if (this.autoChunkOnSelect) {
      this.panel.webview.postMessage({
        command: 'chunkFile',
        chunkStart: start,
        chunkEnd: end
      })
    } else {
      this.panel.webview.postMessage({
        command: 'jumpTo',
        start,
        end
      });
    }
  }

  // -------------------------------------------
  //  Webview Message Handlers
  // -------------------------------------------
  private handleHexCursorChanged(cursor: number) {
    // console.log("cursor changed: " + cursor);
  }

  private handleUpdateCompilationMode(newEager: boolean) {
    opts.eager = newEager;
  }

  private handleUpdateSelectMode(newSelectMode: boolean) {
    this.autoChunkOnSelect = newSelectMode;
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

    const rawhtml = readFileSync(vscode.Uri.file(joinPath(this.context.extensionPath, 'webviews', 'webview.html')).fsPath, 'utf8');
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
        case 'updateCompilationMode': this.handleUpdateCompilationMode(message.args); break;
        case 'updateSelectMode': this.handleUpdateSelectMode(message.args); break;
      }
    })
  }

  private onOpenFileAsHex(args: vscode.Uri) {
    if (!this.panel) {
      this.onOpenHexEditor();
      if (!this.panel.visible) this.panel.reveal();
    }

    const fileBuffer = (args) ?
      readFileSync(args.fsPath) :
      readFileSync(vscode.window.activeTextEditor.document.uri.fsPath);
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
    if (args && !args.fsPath.endsWith(".ksy")) throw new Error("the specified file is not a ksy file");

    const uri = (args) ? args : vscode.window.activeTextEditor.document.uri;
    this.loadedPaths = [];
    const parsed = this.doFullLoad(uri.fsPath)

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
      let thing = platform();
      if (platform() === 'win32') {
        writeFileSync(uri.fsPath.substring(0, uri.fsPath.lastIndexOf('\\') + 1) + name, content, 'utf8');
      } else {
        writeFileSync(uri.path.substring(0, uri.fsPath.replace(/\\/g, '/').lastIndexOf('/') + 1) + name, content, 'utf8');
      }
    }
  }

  private async onCompileAndExamine(args: vscode.Uri) {
    if (args && !args.fsPath.endsWith(".ksy")) throw new Error("the specified file is not a ksy file");

    this.loadedPaths = [];
    const uri = (args) ? args : vscode.window.activeTextEditor.document.uri;
    const parsed = this.doFullLoad(uri.fsPath);

    const compiler = new KaitaiCompiler();
    const debug = true;

    let compiled;
    try {
      compiled = await compiler.compile('javascript', parsed, null, debug);
    } catch(e) {
      console.error(e);
      vscode.window.showErrorMessage(`${e.s$1}: ${e.e$1.s$1} \ntrace:\n${e.stackTrace$1}`);
    }


    const fileName = Object.keys(compiled)[0];
    let fileData: string = compiled[fileName];
    fileData = fileData.replace(
      /(( +)this\._debug\.([a-zA-Z0-9]+)\.end = this\._io\.pos;)/g,
      '$1\n$2this._debug.$3.bitEnd = (8 - this._io.bitsLeft) % 8;'
    ).replace(
      /(( +)this\._debug\.([a-zA-Z0-9]+) = .+)/g,
      '$1\n$2this._debug.$3.bitStart = (8 - this._io.bitsLeft) % 8;'
    );

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
    try {
      await out._root._read();
    } catch(e) {
      console.log(e);
    }

    this.generateRegions(out);
  }

  private onJumpToChunk(start, end) {
    this.setLocation(start, end);
  }

  public dispose() {}
}