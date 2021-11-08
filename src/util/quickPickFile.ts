import * as path from "path";
import * as vscode from "vscode";
import glob from "glob";

class FileItem implements vscode.QuickPickItem {
  label: string;
  description: string;

  constructor(public base: vscode.Uri, public uri: vscode.Uri) {
    this.label = path.basename(uri.fsPath);
    this.description = path.dirname(path.relative(base.fsPath, uri.fsPath));
  }
}

class MessageItem implements vscode.QuickPickItem {
  label: string;
  description = "";
  detail: string;

  constructor(public base: vscode.Uri, public message: string) {
    this.label = message.replace(/\r?\n/g, " ");
    this.detail = base.fsPath;
  }
}

export interface QuickPickOptions {
  placeholder?: string;
  initialValue?: string;
  openLabel?: string;
}

async function pickWithNormalDialog(options?: QuickPickOptions) {
  const file = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: options?.openLabel,
  });
  if (!file || !file.length) return undefined;
  return file[0];
}

function winIterateThroughFileMatches(
  dir: string,
  searchValue: string,
  ct: vscode.CancellationToken,
  findCallback: (error: Error | null, files: vscode.Uri[]) => void
) {
  new Promise<void>((resolve, reject) => {
    glob(
      "**/" + searchValue,
      {
        cwd: dir,
        nocase: true,
      },
      (error, matches) => {
        if (error) {
          findCallback(error, []);
          return resolve();
        }
        if (!ct.isCancellationRequested) {
          findCallback(
            null,
            matches.map((f) => vscode.Uri.file(path.join(dir, f)))
          );
        }

        resolve();
      }
    );
  });
}

export async function quickPickFile(
  options?: QuickPickOptions
): Promise<vscode.Uri | undefined> {
  const disposables: vscode.Disposable[] = [];
  try {
    if (
      !vscode.workspace.workspaceFolders ||
      !vscode.workspace.workspaceFolders.length
    )
      return pickWithNormalDialog(options);
    return await new Promise<vscode.Uri | undefined>((resolve) => {
      const input = vscode.window.createQuickPick<FileItem | MessageItem>();
      input.placeholder = options?.placeholder ?? "Type to search for files";
      let searchToken: vscode.CancellationTokenSource | null;
      disposables.push(
        input.onDidChangeValue((value) => {
          if (searchToken) {
            searchToken.cancel();
            searchToken = null;
          }
          input.items = [];
          if (!value) {
            input.busy = false;
            return;
          }
          input.busy = true;
          // Get all folders we need to search through
          const cwds = vscode.workspace.workspaceFolders!.map(
            (f) => f.uri.fsPath
          );
          searchToken = new vscode.CancellationTokenSource();
          disposables.push(searchToken);
          let cwdsCompleted = 0;
          let hasErrored = false;
          cwds.map(async (cwd) => {
            await winIterateThroughFileMatches(
              cwd,
              value,
              searchToken!.token,
              (err, files) => {
                if (err) {
                  if (!hasErrored) {
                    hasErrored = true;
                    // Clear any existing items
                    input.items = [];
                  }
                  input.items = input.items.concat([
                    new MessageItem(vscode.Uri.file(cwd), err.message),
                  ]);
                  return;
                }
                input.items = input.items.concat(
                  files.map((file) => new FileItem(vscode.Uri.file(cwd), file))
                );
              }
            );
            cwdsCompleted++;
            if (cwdsCompleted == cwds.length) {
              input.busy = false;
            }
          });
        }),
        input.onDidChangeSelection((items) => {
          const item = items[0];
          if (item instanceof FileItem) {
            resolve(item.uri);
            input.hide();
          }
        }),
        input.onDidHide(() => {
          resolve(undefined);
          input.dispose();
        })
      );
      input.show();
      if (options?.initialValue) input.value = options.initialValue;
    });
  } finally {
    disposables.forEach((d) => d.dispose());
  }
}
