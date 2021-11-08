import * as vscode from "vscode";
import { HexEditor, HexEditorInput } from "./features/hexEditor";
import { Logger } from "./logger";
import { Disposable } from "./util/dispose";

export class HexEditorManager extends Disposable {
  #hexEditor: HexEditor | null = null;
  #openFile: vscode.Uri | null = null;

  public get hexEditor(): HexEditor | null {
    return this.#hexEditor;
  }
  
  public get openFile(): vscode.Uri | null {
    return this.#openFile;
  }

  public constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly logger: Logger
  ) {
    super();
  }

  public async openFileInHexEditor(resource: vscode.Uri) {
    const input: HexEditorInput = {
      locked: false,
      resource,
    };

    if (!this.#hexEditor) {
      this.#hexEditor = this.createHexEditorForFile(resource);
      this.#openFile = resource;
      this._register(this.#hexEditor);
      this.#hexEditor.onDispose(() => {
        this.#hexEditor = null;
        this.#openFile = null;
      });
    } else {
      this.#hexEditor.setInput(input);
      this.#openFile = resource;
    }
  }

  private createHexEditorForFile(resource: vscode.Uri) {
    const input: HexEditorInput = {
      locked: false,
      resource,
    };

    return HexEditor.create(
      input,
      vscode.ViewColumn.Beside,
      this.context,
      this.logger
    );
  }
}
