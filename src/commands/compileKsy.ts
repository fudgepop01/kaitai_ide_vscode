import * as vscode from "vscode";
import * as path from "path";
import supportedLangs from "../util/supportedLangs";
import * as nls from "vscode-nls";
import { writeFileSync } from "fs";
import { isKsyFile } from "../util/file";
import type { Command } from "../commandManager";
import type { KSEngine } from "../ksEngine";
import type { KSCompilerSupportedLanguage } from "../ksc-typescript/kaitai-struct-compiler-js-fastopt";

const localize = nls.loadMessageBundle();

export class CompileCommand implements Command {
  public readonly id = "kaitaiStruct.compileKsy";

  public constructor(private readonly ksEngine: KSEngine) {}

  public async execute(uri?: vscode.Uri) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
      if (vscode.window.activeTextEditor) {
        resource = vscode.window.activeTextEditor.document.uri;
      }
    }
    if (!resource) return;
    if (!isKsyFile(resource)) {
      const message = localize(
        "onFileNotKsy",
        "The specified file is not a ksy file."
      );
      await vscode.window.showErrorMessage(message);
      return;
    }

    vscode.window.showInformationMessage("choose a language");
    const language: KSCompilerSupportedLanguage | undefined =
      (await vscode.window.showQuickPick(supportedLangs, {
        placeHolder: "javascript",
      })) as KSCompilerSupportedLanguage | undefined;

    if (!language) return;

    vscode.window.showInformationMessage("enable debug mode?");

    const debugMode =
      (await vscode.window.showQuickPick(["true", "false"], {
        placeHolder: "false",
      })) === "true";

    if (typeof debugMode !== "boolean") return;

    try {
      const compiled = await this.ksEngine.safeLoadAndCompileTo(
        language,
        resource,
        debugMode
      );
      if (!compiled) return;
      for (const [name, content] of Object.entries(compiled)) {
        const newFilePath = path.join(path.dirname(resource.fsPath), name);
        writeFileSync(newFilePath, content, "utf8");
      }
    } catch (e) {
      console.error(e);
      vscode.window.showErrorMessage(`Error with KS definition: ${e}`);
      return;
    }
  }
}
