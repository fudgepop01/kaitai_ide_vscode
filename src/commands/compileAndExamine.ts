import * as vscode from "vscode";
import * as nls from "vscode-nls";
import { isKsyFile } from "../util/file";
import type { Command } from "../commandManager";
import type { KSEngine } from "../ksEngine";
import type { HexEditorManager } from "../hexEditorManager";

const localize = nls.loadMessageBundle();

export class CompileAndExamineCommand implements Command {
  public readonly id = "kaitaiStruct.compileAndExamine";

  public constructor(
    private readonly ksEngine: KSEngine,
    private readonly hexEditorManager: HexEditorManager
  ) {}

  public async execute(uri?: vscode.Uri) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
      if (vscode.window.activeTextEditor) {
        resource = vscode.window.activeTextEditor.document.uri;
      }
    }

    if (!resource) return;

    if (resource && !isKsyFile(resource)) {
      const message = localize(
        "onFileNotKsy",
        "The specified file is not a ksy file."
      );
      await vscode.window.showErrorMessage(message);
      return;
    }
    if (this.hexEditorManager.hexEditor == null) {
      const message = localize(
        "onHexEditorNotOpenError",
        "You must open a file with the hex editor before doing that."
      );
      await vscode.window.showErrorMessage(message);
      return;
    }

    try {
      const parsedFunction = await this.ksEngine.safeLoadAndCompileFunction(
        resource,
        true
      );
      if (parsedFunction != null)
        this.hexEditorManager.hexEditor.updateKaitaiStruct(parsedFunction, this.ksEngine.docComments);
    } catch (e) {
      console.log(e);
      vscode.window.showErrorMessage(`Error with KS definition: ${e}`);
    }
  }
}
