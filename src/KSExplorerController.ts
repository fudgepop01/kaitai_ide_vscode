import * as vscode from 'vscode';
import { analysisLeaf } from './util/regionAnalysis';

export interface KSNode {
  start: number;
  end: number;
  name: string;
  array: boolean;
  type: string | "[instance]";
  analysisLeaf?: analysisLeaf;
  regionIndex?: number;
  content?: string | number | Uint8Array | string[] | number[] | Uint8Array[];
  subRegions?: KSNode[] | KSNode[][];
}

export class KSTreeDataProvider implements vscode.TreeDataProvider<KSNode> {

  constructor(public data: any){}

  public getChildren(element: KSNode): KSNode[] | any {
    if (!element) return this.data;
    if (element.type === '[instance]') {
      return [element.analysisLeaf.run()];
    }
    if (element.subRegions && Array.isArray(element.subRegions[0])) {
      return (element.subRegions as any[]).map((val: any, index: number) => {
        let arrlen = element.subRegions[index as any as string].length;
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

    let typeLabel = '';
    if ((content || content === 0) &&
        !(content instanceof Uint8Array) &&
        !Array.isArray(content)) {
      typeLabel = `${content}`;
    }
    else {
      typeLabel = type;
    }

    let arrayLabel = '';
    if (array) {
      arrayLabel = `[${(element.subRegions || element.content as [any]).length}]`;
    }

    return {
      tooltip: JSON.stringify({...element, analysisLeaf: null, subRegions: "___", content: (!(content instanceof Uint8Array)) ? content : '<Binary Data>' }, null, 2),
      label: `${name}: ${typeLabel}${arrayLabel}`,
      collapsibleState:
        (element.subRegions || Array.isArray(element.content) || element.type === '[instance]')
        ? vscode.TreeItemCollapsibleState.Collapsed
        : void 0,
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