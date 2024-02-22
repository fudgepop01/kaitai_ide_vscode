import * as vscode from 'vscode';
import { analysisLeaf, simplify } from './util/regionAnalysis';
import editor from './editorController';
import { HexEditor } from './features/hexEditor';

export interface KSNode {
  bitStart?: number;
  bitEnd?: number;
  start: number;
  end: number;
  ioOffset?: number;
  strippedSubRegions?: any;

  regionPath?: string;
  name: string;
  array?: boolean;
  type: string | "[instance]";
  analysisLeaf?: analysisLeaf;
  regionIndex?: number;
  content?: string | number | Uint8Array | string[] | number[] | Uint8Array[];
  subRegions?: KSNode[] | KSNode[][];
  parent?: KSNode;
}

export class KSTreeDataProvider implements vscode.TreeDataProvider<KSNode> {

  private _onDidChangeTreeData: vscode.EventEmitter<KSNode | undefined | null | void> = new vscode.EventEmitter<KSNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<KSNode | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(public data: any, private childCallback: (element: KSNode) => void){}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getChildren(element: KSNode): KSNode[] | any {
    if (!element) return this.data;
    this.childCallback(element);
    if (element.type === '[instance]' || element.type.startsWith('[rec]')) {
      const result = element.analysisLeaf.run();
      if (!result) {
        element.type = 'null';
        element.start = NaN;
        element.end = NaN;
        delete element.subRegions;
        delete element.content;
      } else {
        Object.assign(element, result);
      }
      this.refresh();
      return [];
    }
    if (element.subRegions && Array.isArray(element.subRegions[0])) {
      return (element.subRegions as any[]).map((val: any, index: number) => {
        let arrlen = element.subRegions[index as any as string].length;
        return {
          name: '' + index,
          type: element.type,
          start: element.subRegions[index][0].start,
          end: element.subRegions[index][arrlen - 1].end,
          parent: element,
          subRegions: [
            ...val
          ]
        }
      })
    }
    return element.subRegions;
  }

  public getParent(element: KSNode): vscode.ProviderResult<KSNode> {
    return element.parent;
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
      tooltip: JSON.stringify({...element, parent: undefined, analysisLeaf: undefined, subRegions: undefined, content: (!(content instanceof Uint8Array)) ? content : '<Binary Data>' }, null, 2),
      label: `${name}: ${typeLabel}${arrayLabel}`,
      collapsibleState:
        (element.subRegions || Array.isArray(element.content) || element.type === '[instance]' || element.type.startsWith('[rec]'))
        ? vscode.TreeItemCollapsibleState.Collapsed
        : void 0,
      command: (element.start == undefined) ? void 0 : {
        command: "kaitaiStruct.jumpToChunk",
        arguments: [element.start, element.end, (element.regionPath?.split(',').length) ?? -1],
        title: "jump to chunk"
      }
    }
  }

}

export class KSExplorer implements vscode.Disposable {

  private KSViewer: vscode.TreeView<KSNode>;
  private lastSelected?: KSNode;

  constructor(private owner: HexEditor, data: any) {
    const childCallback = (element: KSNode) => { this.lastSelected = element; }
    const treeDataProvider = new KSTreeDataProvider(data, childCallback);

    this.KSViewer = vscode.window.createTreeView("kaitaiStructExplorer", { treeDataProvider });
    this.KSViewer.onDidChangeSelection(e => {
      if (e.selection[0]) this.lastSelected = e.selection[0];
    });

    treeDataProvider.onDidChangeTreeData(e => {
      if (this.lastSelected) this.KSViewer.reveal(this.lastSelected, { focus: true });
      // owner.setRegions(simplify(data));
    })
  }

  dispose() {
    this.KSViewer.dispose();
  }
}