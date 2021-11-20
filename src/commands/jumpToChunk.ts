import * as vscode from "vscode";
import * as nls from "vscode-nls";
import type { Command } from "../commandManager";
import type { KSEngine } from "../ksEngine";
import type { HexEditorManager } from "../hexEditorManager";
import { quickPickFile } from "../util/quickPickFile";

const localize = nls.loadMessageBundle();

export class JumpToChunkCommand implements Command {
  public readonly id = "kaitaiStruct.jumpToChunk";

  public constructor(private readonly hexEditorManager: HexEditorManager) {}

  public async execute(start: number, end: number) {
    if (!this.hexEditorManager.hexEditor) return;
    this.hexEditorManager.hexEditor.setLocation(start, end);
  }
}
