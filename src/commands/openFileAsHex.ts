import * as vscode from "vscode";
import * as nls from "vscode-nls";
import type { Command } from "../commandManager";
import type { HexEditorManager } from "../hexEditorManager";

const localize = nls.loadMessageBundle();

export class OpenFileAsHexCommand implements Command {
  public readonly id = "kaitaiStruct.openFileAsHex";

  public constructor(private readonly hexEditorManager: HexEditorManager) {}

  public async execute(uri?: vscode.Uri) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
      if (vscode.window.activeTextEditor) {
        resource = vscode.window.activeTextEditor.document.uri;
      }
    }

    if (!resource) return;

    this.hexEditorManager.openFileInHexEditor(resource);
  }
}
