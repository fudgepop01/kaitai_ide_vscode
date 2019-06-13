'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import Controller from './editorController';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let controller: vscode.Disposable = new Controller(context);
    context.subscriptions.push(controller);

}

// this method is called when your extension is deactivated
export function deactivate() {
}

