import * as vscode from 'vscode';
import { inspect } from 'util';

export interface KSNode {
  start: number;
  end: number;
  name: string;
  array: boolean;
  type: string | "__instance";
  content?: string | number | Uint8Array | string[] | number[] | Uint8Array[];
  subRegions?: KSNode[] | KSNode[][];
}

export class KSTreeDataProvider implements vscode.TreeDataProvider<KSNode> {

  constructor(public data: any){}

  public getChildren(element: KSNode): KSNode[] | any {
    if (!element) return this.data;
    if (element.subRegions && Array.isArray(element.subRegions[0])) {
      return (element.subRegions as any).map((val: any, index: string) => {
        let arrlen = element.subRegions[index].length;
        return {
          name: '' + index,
          type: element.type,
          start: element.subRegions[index][0].start,
          end: element.subRegions[index][arrlen - 1].end,
          subRegions: [
            ...val
          ]
        }
      })
    }
    return element.subRegions;
  }

  public getTreeItem(element: KSNode): vscode.TreeItem {
    const {name, type, array, content} = element;

    return {
      tooltip: JSON.stringify({...element, subRegions: '', content: (content !instanceof Uint8Array) ? content : '<Binary Data>' }, null, 2),
      label: `${name}: ${(content || content === 0) ? content : type}${array ? "[" + element.subRegions.length + "]" : ''}`,
      collapsibleState: element.subRegions ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
      command: (element.start == undefined) ? void 0 : {
        command: "kaitaiStruct.jumpToChunk",
        arguments: [element.start, element.end],
        title: "jump to chunk"
      }
    }
  }

}

export class KSExplorer implements vscode.Disposable {

  private KSViewer: vscode.TreeView<KSNode>;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext, data: any) {
    this.context = context;
    const treeDataProvider = new KSTreeDataProvider(data);

    this.KSViewer = vscode.window.createTreeView("kaitaiStructExplorer", { treeDataProvider });
  }

  dispose() {
    this.KSViewer.dispose();
  }
}