'use strict';

import * as vscode from 'vscode';
import * as KaitaiStream from 'kaitai-struct/KaitaiStream';
import * as KaitaiCompiler from 'kaitai-struct-compiler';
import { safeLoad as safeLoadYaml } from 'js-yaml';

import { join as joinPath } from 'path';
import { readFileSync, utimes } from 'fs';

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

  public context: vscode.ExtensionContext;
  public commands: vscode.Disposable[] = [];
  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    // registering commands
    const registerCommand = vscode.commands.registerCommand;
    this.commands.push(...[
      registerCommand(`${namespace}.openHexEditor`, this.onOpenHexEditor.bind(this)),
      registerCommand(`${namespace}.openFileAsHex`, this.onOpenFileAsHex.bind(this)),
      registerCommand(`${namespace}.compileAndExamine`, this.onCompileAndExamine.bind(this))
    ]);
  }

  // -------------------------------------------
  //  Helpers
  // -------------------------------------------
  private mergeData(debugData: any, mainData: any, dataName: string) {
    let out = {
      ...debugData,
      name: dataName
    };

    if (typeof mainData !== "object" || mainData instanceof Uint8Array) {
      // contents are a primitive type
      out.content = mainData;
    }
    else if (Array.isArray(mainData)) {
      // we're dealing with an array of data
      if (typeof mainData[0] !== "object" || mainData[0] instanceof Uint8Array) {
        // array consists of primitives
        out.content = mainData;
      } else {
        // array consists of more structures
        out.subRegions = [];
        for (const entry of mainData) {
          out.subRegions.push(this.analyzeStructure(entry));
        }
      }
    }
    else  {
      // we're dealing with another object
      out.subRegions = this.analyzeStructure(mainData);
    }

    return out;
  }

  private analyzeStructure(input: any) {
    const builder = {
      instances: [],
      seq: []
    }
    // find / get sequence
    for (const key of Object.keys(input._debug)) {
      if (key === 'arr') continue;
      else {
        builder.seq.push(this.mergeData(input._debug[key], input[key], key));
      }
    };

    // find / get instances
    for (const key of Reflect.ownKeys(input.__proto__).map(k => k.toString())) {
      if (["constructor", "_read"].includes(key)) continue;
      if (eager) {
        builder.seq.push(this.mergeData(input._debug[`_m_${key}`], input[key], key));
      }
      else {
        builder.instances.push(key);
      }
    }

    let out;
    let regionData;
    if (eager) regionData = [...builder.seq];
    else {
      out = builder;
      regionData = [...builder.seq];
    }

    return regionData;
  }

  private generateRegions(ksyOutput: any) {
    console.log(ksyOutput);
    const regions = this.analyzeStructure(ksyOutput);
    if (eager) {
      this.setRegions(regions);
    }
    else {


      this.setRegions(regions);
    }

  }

  // -------------------------------------------
  //  Post Message to Webview
  // -------------------------------------------
  private setRegions(regionData: any) {
    this.panel.webview.postMessage({
      command: 'updateRegions',
      regions: regionData
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
    const panel = vscode.window.createWebviewPanel(
      'fudgedit',
      'kaitai struct debugger',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(joinPath(this.context.extensionPath, 'node_modules/fudgedit/dist'))
        ],
      }
    );

    const rawhtml = readFileSync(joinPath(this.context.extensionPath, 'src', 'webview.html'), 'utf8');
    panel.webview.html = rawhtml.replace(/{{EXTPATH}}/g, this.context.extensionPath);
    this.panel = panel;

    // recieving messages
    this.panel.webview.onDidReceiveMessage((message: {event: string, args: any}) => {
      switch(message.event) {
        case 'hexLineChanged': this.handleHexCursorChanged(message.args); break;
      }
    })
  }

  private onOpenFileAsHex(args: vscode.Uri) {
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
    out._root._read();

    this.generateRegions(out);
  }

  public dispose() {}
}