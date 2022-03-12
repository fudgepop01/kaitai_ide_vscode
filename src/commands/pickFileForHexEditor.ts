import * as vscode from "vscode";
import * as nls from "vscode-nls";
import * as path from "path";
import type { Command } from "../commandManager";
import type { KSEngine } from "../ksEngine";
import type { HexEditorManager } from "../hexEditorManager";
import { quickPickFile } from "../util/quickPickFile";
import { isKsyFile } from "../util/file";

const localize = nls.loadMessageBundle();

export class PickFileForHexEditorCommand implements Command {
  public readonly id = "kaitaiStruct.pickFileForHexEditor";

  public constructor(
    private readonly ksEngine: KSEngine,
    private readonly hexEditorManager: HexEditorManager
  ) {}

  public async execute() {
    let initialValue: string | undefined;
    let ksyFile: vscode.Uri | undefined;
    let expectedFileExt: string | undefined;
    if (vscode.window.activeTextEditor) {
      const uri = vscode.window.activeTextEditor.document.uri;
      if (isKsyFile(uri)) {
        const baseName = path.basename(uri.fsPath, path.extname(uri.fsPath));
        if (baseName) {
          ksyFile = uri;
          expectedFileExt = `.${baseName.toLowerCase()}`;
          initialValue = "*" + expectedFileExt;
        }
      }
    }
    const file = await quickPickFile({
      placeholder: "Search for files by name (use * for wildcards)",
      initialValue,
    });
    if (!file) return;

    this.hexEditorManager.openFileInHexEditor(file);
    if (
      ksyFile &&
      this.hexEditorManager.hexEditor &&
      path.extname(file.fsPath)?.toLowerCase() === expectedFileExt
    ) {
      try {
        const parsedFunction = await this.ksEngine.safeLoadAndCompileFunction(
          ksyFile,
          true
        );
        if (parsedFunction != null)
          this.hexEditorManager.hexEditor.updateKaitaiStruct(parsedFunction);
      } catch (e) {
        vscode.window.showErrorMessage(`Error with KS definition: ${e}`);
      }
    }
  }
}
