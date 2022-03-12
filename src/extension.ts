// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CommandManager } from './commandManager';
import * as commands from './commands/index';
import { HexEditorManager } from './hexEditorManager';
import { KSEngine } from './ksEngine';
import { Logger } from './logger';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const logger = new Logger();
    const ksEngine = new KSEngine(logger);
    const hexEditorManager = new HexEditorManager(context, logger);
    context.subscriptions.push(hexEditorManager);
    context.subscriptions.push(registerCommands(ksEngine, hexEditorManager));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function registerCommands(ksEngine: KSEngine, hexEditorManager: HexEditorManager): vscode.Disposable {
    const commandManager = new CommandManager();
	commandManager.register(new commands.CompileCommand(ksEngine));
	commandManager.register(new commands.OpenFileAsHexCommand(hexEditorManager));
	commandManager.register(new commands.CompileAndExamineCommand(ksEngine, hexEditorManager));
	commandManager.register(new commands.JumpToChunkCommand(hexEditorManager));
	commandManager.register(new commands.PickFileForHexEditorCommand(ksEngine, hexEditorManager));
	return commandManager;
}

