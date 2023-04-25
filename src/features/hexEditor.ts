import * as vscode from "vscode";
import * as nls from "vscode-nls";
import * as path from "path";
import * as fs from "fs";
import { Logger } from "../logger";
import { Disposable } from "../util/dispose";
import { lazy } from "../util/lazy";
import KaitaiStream from 'kaitai-struct/KaitaiStream';
import { analyzeStructure, opts } from "../util/regionAnalysis";
import { KSExplorer } from "../KSExplorerController";
import { KSParseFunction } from "../ksEngine";
import { getNonce } from "../util/getNonce";

const localize = nls.loadMessageBundle();

interface WebviewMessage {
  readonly source: string;
}

interface HexCursorChangedMessage extends WebviewMessage {
  readonly event: "hexCursorChanged";
  readonly args: number;
}

interface UpdateCompilationModeMessage extends WebviewMessage {
  readonly event: "updateCompilationMode";
  readonly args: boolean;
}

interface UpdateSelectModeMessage extends WebviewMessage {
  readonly event: "updateSelectMode";
  readonly args: boolean;
}

export interface HexEditorInput {
	readonly resource: vscode.Uri;
	//readonly resourceColumn: vscode.ViewColumn;
	readonly locked: boolean;
	//readonly line?: number;
}

export class HexEditor extends Disposable {
  public static readonly viewType = "kaitaiStruct.fudgedit";

  private readonly _onDisposeEmitter = this._register(new vscode.EventEmitter<void>());
  private autoChunkOnSelect: boolean = false;
  private currentFile: Buffer | null = null;

  public readonly onDispose = this._onDisposeEmitter.event;
  public tree: KSExplorer | null = null;

  public static create(
    input: HexEditorInput,
    previewColumn: vscode.ViewColumn,
    context: vscode.ExtensionContext,
    logger: Logger
  ): HexEditor {
    const webview = vscode.window.createWebviewPanel(
      HexEditor.viewType,
      HexEditor.getPreviewTitle(input.resource, input.locked),
      previewColumn,
      { ...HexEditor.getWebViewPanelOptions(context) }
    );

    return new HexEditor(
      webview,
      input,
      context.extensionPath,
      logger,
      context
    );
  }

  public constructor(
    public readonly panel: vscode.WebviewPanel,
    private input: HexEditorInput,
    private readonly extensionPath: string,
    private readonly logger: Logger,
    context: vscode.ExtensionContext
  ) {
    super();
    this.extensionPath = extensionPath;

    opts.callback = (regions) => this.setRegions(regions);

    const webviewHtml = fs.readFileSync(
      vscode.Uri.file(
        path.join(this.extensionPath, "webviews", "webview.html")
      ).fsPath,
      "utf8"
    );

    panel.webview.html = webviewHtml.replace(
      /{{EXTPATH_MODULE}}/g,
      panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "webviews", "resources", "build", "fudgeapps.esm.js")).toString()
    ).replace(
      /{{EXTPATH_NOMODULE}}/g,
      panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "webviews", "resources", "build", "fudgeapps.js")).toString()
    ).replace(
      /{{EXTPATH}}/g,
      panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "webviews", "resources", "build")).toString()
    ).replace(
      /{{WEBVIEW_CSP_SRC}}/g,
      panel.webview.cspSource
    ).replace(
      /{{NONCE}}/g,
      getNonce()
    );
    this._register(panel.onDidDispose(() => this.dispose()));

    // receiving messages
    this._register(this.panel.webview.onDidReceiveMessage(
      (
        e:
          | HexCursorChangedMessage
          | UpdateCompilationModeMessage
          | UpdateSelectModeMessage
      ) => {
        switch (e.event) {
          case "hexCursorChanged":
            this.handleHexCursorChanged(e.args);
            break;
          case "updateCompilationMode":
            this.handleUpdateCompilationMode(e.args);
            break;
          case "updateSelectMode":
            this.handleUpdateSelectMode(e.args);
            break;
        }
      }
    ));

    this.refreshFromInput();
  }

  override dispose() {
    this._onDisposeEmitter.fire();
    if (this.tree) {
      this.tree.dispose();
      this.tree = null;
    }
    vscode.commands.executeCommand('setContext', 'kaitaiStruct.hasFileInHexEditor', false);
    super.dispose();
  }

  public setInput(input: HexEditorInput) {
    // TODO: Cleanup current input
    this.input = input;
    this.refreshFromInput();
  }

  public reveal() {
    this.panel.reveal();
  }

  public openFile(uri: vscode.Uri) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
      if (vscode.window.activeTextEditor) {
        resource = vscode.window.activeTextEditor.document.uri;
      }
    }
    if (!resource) return;
    this.currentFile = fs.readFileSync(resource.fsPath);
    const payload = this.currentFile.toString('base64');

    this.panel.webview.postMessage({
      command: 'openFile',
      file: {
        bits: payload,
        name: 'idkSomeValue'
      }
    })
  }

  public async updateKaitaiStruct(parseFunction: KSParseFunction, docComments: {[key: string]: string}) {
    if (!this.currentFile) return;
    const stream = new KaitaiStream(new Uint8Array(this.currentFile), 0);
    const out = new (parseFunction(KaitaiStream))(stream) as any;
    try {
      await out._root._read();
    } catch(e) {
      this.logger.log("Error updating kaitai struct", e);
      console.error(e);
    }

    this.generateRegions(out, docComments);
  }

  public jumpToChunk(start: number, end: number) {
    this.setLocation(start, end);
  }

  private async refreshFromInput() {
    if (!this.input) {
      vscode.commands.executeCommand('setContext', 'kaitaiStruct.hasFileInHexEditor', false);
      // TODO: Clean-up stuff
      return;
    }

    const fileBuffer = fs.readFileSync(this.input.resource.fsPath);
    this.currentFile = fileBuffer;
    const payload = fileBuffer.toString('base64');

    this.panel.webview.postMessage({
      command: 'openFile',
      file: {
        bits: payload,
        name: 'idkSomeValue'
      }
    })
    vscode.commands.executeCommand('setContext', 'kaitaiStruct.hasFileInHexEditor', true);
  }

  private generateRegions(ksyOutput: any, docComments: {[key: string]: string} = {}) {
    console.log(ksyOutput);
    let analyzed;
    try {
      analyzed = analyzeStructure(ksyOutput, docComments);
    } catch(e) {
      console.error(e)
    }
    const regions = analyzed.regionData;
    console.log(analyzed.fullData);
    const tree = new KSExplorer(analyzed.fullData);
    this.tree = tree;
    // console.log(tree);
    this.setRegions(regions);

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

  public setLocation(start: number, end: number) {
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

  private static getPreviewTitle(
    resource: vscode.Uri,
    locked: boolean
  ): string {
    return locked
      ? localize(
          "lockedPreviewTitle",
          "[kaitai struct debugger] {0}",
          path.basename(resource.fsPath)
        )
      : localize(
          "previewTitle",
          "kaitai struct debugger {0}",
          path.basename(resource.fsPath)
        );
  }

  private static getWebViewPanelOptions(context: vscode.ExtensionContext): vscode.WebviewPanelOptions & vscode.WebviewOptions {
    return {
      retainContextWhenHidden: true,
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, "webviews", "resources"),
      ],
    }
  }
}
