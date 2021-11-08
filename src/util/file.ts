import * as vscode from 'vscode';

export function isKsyFile(resource: vscode.Uri | vscode.TextDocument): boolean {
	if (resource instanceof vscode.Uri) {
		return resource.fsPath.endsWith(".ksy");
	} else if (typeof resource.languageId === "string") {
		return resource.languageId.toLowerCase() === 'ksy-yaml';
	}
	return false;
}