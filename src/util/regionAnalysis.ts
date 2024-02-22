import { nestedGetter } from './nestedPropertyMethods';
import { KSNode } from '../KSExplorerController';

export const opts = {
  eager: false,
  callback: (_: any) => {},
  currentRegions: {} as any
};

interface ISimple {
  start: number;
  end: number;
  name: string;
  content?: any;
  subRegions?: any;
  doc?: string;
  color?: string;
}

interface ICircleCheck {
  start: number;
  type: string;
  name: string;
  regionPath: string;
  obj: KSNode;
}

const mergeData = (debugData: any, mainData: any, dataName: string, parents: ICircleCheck[], regionNum: number | string, docComments: {[key: string]: string}): KSNode => {

  let out: KSNode = {
    start: debugData.start + debugData.ioOffset,
    end: debugData.end + debugData.ioOffset,
    bitStart: debugData.bitStart,
    bitEnd: debugData.bitEnd,
    ioOffset: debugData.ioOffset,
    name: dataName,
    array: false,
    type: mainData.constructor.name,
    subRegions: undefined,
    strippedSubRegions: undefined,
    content: undefined
  };

  // prevents circular references on initial compile (important for eager mode)
  // also allows for keeping track of the index of an array entry
  let existingIndex = parents.map(({start, type}) => JSON.stringify({start, type})).indexOf(JSON.stringify({start: out.start, type: out.type}));
  if (existingIndex != -1 ) {
    // return from circular here
    return {
      ...out,
      start: -1,
      end: -1,
      type: '[circular] - ' + parents.slice(0, existingIndex + 1).map(({name}) => name).join('/')
    }
  } else {
    // sets subregion path here
    let lastRegionPath = '';
    if (parents.length != 0) lastRegionPath = parents[parents.length - 1].regionPath + ',';
    parents.push({start: out.start, type: out.type, name: out.name, regionPath: `${lastRegionPath}${regionNum}`});
  }

  const lastRegionPath = (parents.length != 0) ? parents[parents.length - 1].regionPath + ',' : '';
  out.regionPath = lastRegionPath.substring(0, lastRegionPath.length - 1);
  
  if (typeof mainData !== "object" || mainData instanceof Uint8Array) {
    // contents are a primitive type
    out.content = mainData;
    out.array = false;
  }
  else if (Array.isArray(mainData) && mainData.length > 0) {
    // we're dealing with an array of data
    out.array = true;
    out.type = mainData[0].constructor.name;

    if (typeof mainData[0] !== "object" || mainData[0] instanceof Uint8Array) {
      // array consists of primitives

      let size = debugData.end - debugData.start;
      let offsetTracker = (size / mainData.length);
      out.subRegions = (mainData as any[]).map((val: any, index: number): KSNode => {
        return {
          name: '' + index,
          type: mainData.constructor.name,
          start: (debugData.start + debugData.ioOffset) + offsetTracker * index,
          end: (debugData.start + debugData.ioOffset) + offsetTracker * (index + 1),
          content: val
        }
      });
      out.strippedSubRegions = out.subRegions;
    } else {
      // array consists of more structures
      out.subRegions = [];
      out.strippedSubRegions = [];

      for (const [idx, entry] of mainData.entries()) {
        parents.push({name: `${idx}`, type: entry.constructor.name, regionPath: `${lastRegionPath}${idx}`, start: -1, obj: out});
        let data = analyzeStructure(entry, docComments, parents);
        parents.pop();
        out.subRegions.push(data.fullData);
        out.strippedSubRegions.push({start: NaN, end: NaN, name: '', content: '', subRegions: data.regionData});
      }
    }
  }
  else if (Array.isArray(mainData)) {
    out.array = true;
    out.type = "UNKNOWN TYPE";
    out.subRegions = [];
    out.strippedSubRegions = [];
  }
  else  {
    // we're dealing with another object
    const data = analyzeStructure(mainData, docComments, parents);
    out.subRegions = data.fullData;
    out.strippedSubRegions = data.regionData;
  }

  out.subRegions?.flat().forEach((ksn, i) => {
    ksn.parent = parents[parents.length - 1].obj;
    if (ksn.array) ksn.regionPath = `${lastRegionPath}${i},${regionNum}`;
  });

  parents.pop()
  return out;
}

// analyzes a single structure (called when expanding an instance too)
export const analyzeStructure = (input: any, docComments: {[key: string]: string}, parents?: ICircleCheck[]) => {
  if (!parents) parents = [];

  const regionData = [];
  const fullData: KSNode[] = [];

  function dataRoutine(key: string, keyIdx: number, isInstance: boolean) {
    let debugInf: any;

    const mainData = input[key];
    if (isInstance) debugInf = input._debug[`_m_${key}`];
    else debugInf = input._debug[key];

    if (mainData == undefined || key.startsWith('_m_')) return;
    const merged = mergeData(debugInf, mainData, key, parents, regionData.length, docComments);

    const simple: ISimple = {
      start: (merged.bitStart) ? merged.start - 1 + merged.bitStart / 8 : merged.start,
      end: (merged.bitEnd) ? merged.end - 1 + merged.bitEnd / 8 : merged.end,
      name: merged.name,
      content: merged.content, 
    };

    const docComment = docComments[parents!.map(p => p.type).join(".") + ((isInstance) ? '' : 'seq.') + key];
    if (docComment) {
      simple.doc = docComment;
    }

    if (merged.regionPath) {

      const colorOffset = merged.regionPath.split(',').length % 10;
      const colorIdx = colorOffset + keyIdx;
      let mainValue = 0xFF - colorOffset * 5;
      let otherValues = 100 + (colorOffset * 10);
      if (colorIdx % 6 >= 3) {
        const swap = otherValues;
        otherValues = mainValue;
        mainValue = swap;
      }
      let color = mainValue << ((colorIdx % 3) * 8);
      color |= otherValues << (((colorIdx + 1) % 3) * 8);
      color |= otherValues << (((colorIdx + 2) % 3) * 8);
      // if (color > 0xFFFFFF) {
      //   color |= 0xF;
      //   color &= 0xFFFFFF;
      // }

      simple.color = `#${color.toString(16)}`;
    }

    if (merged.strippedSubRegions) {
      simple.subRegions = merged.strippedSubRegions;
      delete merged.strippedSubRegions;
    }

    regionData.push(simple);
    fullData.push(merged);
  }

  // find / get sequence
  for (const [i, key] of Object.keys(input._debug).entries()) {
    if (key === 'arr') continue;
    else {
      dataRoutine(key, i, false);
    }
  };

  // find / get instances
  for (const [keyIdx, key] of Reflect.ownKeys(input.__proto__).map(k => k.toString()).entries()) {
    if (["constructor", "_read"].includes(key) || key.startsWith('_m_')) continue;
    if (opts.eager) {
      if (input[key] == undefined) continue;
      if (input.constructor.name !== input[key].constructor.name) dataRoutine(key, keyIdx, true);
      else {
        // prevents indefinitely recursive types from parsing infinitely (ex. linked lists)
        let toPush: KSNode = {
          type: "[rec]",
          name: key,
          analysisLeaf: undefined,
          parent: parents[parents.length - 1].obj,
          regionPath:
            (parents.length > 0)
            ? `${parents[parents.length - 1].regionPath},${regionData.length}`
            : `${regionData.length}`
        }
        toPush.analysisLeaf = new analysisLeaf(toPush, input, opts.callback, docComments);
        regionData.push({start: -1, end: -1, name: '', content: ''});
        fullData.push(toPush);
      }
    }
    else {
      // enables the continuation of parsing on command
      let toPush: KSNode = {
        type: "[instance]",
        name: key,
        analysisLeaf: undefined,
        parent: parents[parents.length - 1].obj,
        subRegions: [],
        regionPath:
          (parents.length > 0)
          ? `${parents[parents.length - 1].regionPath},${regionData.length}`
          : `${regionData.length}`
      }
      // the callback is necessary to update the region data
      toPush.analysisLeaf = new analysisLeaf(toPush, input, opts.callback, docComments);
      regionData.push({start: -1, end: -1, name: '', content: '', subRegions: []});
      fullData.push(toPush);
    }
  }

  return {
    regionData,
    fullData
  }
}

export const simplify = (regionData: KSNode[]) => {
  const out: ISimple[] = [];
  
  for (const node of regionData) {
    let subRegions: ISimple[] | ISimple[][] = undefined;
    
    if (node.subRegions) {
      if (Array.isArray(node.subRegions[0])) {
        subRegions = (node.subRegions as KSNode[][]).map((region: KSNode[]) => {
          return simplify(region);
        });
      } else {
        subRegions = simplify(node.subRegions as KSNode[]);
      }
    }
    
    const simpleNode: ISimple = {
      start: (node.bitStart) ? node.start - 1 + node.bitStart / 8 : node.start,
      end: (node.bitEnd) ? node.end - 1 + node.bitEnd / 8 : node.end,
      name: node.name,
      content: node.content,
      doc: undefined, // TODO: debug comments 
      subRegions
    };

    out.push(simpleNode);
  };

  return out;
}

export class analysisLeaf {
  constructor(
    private elementData,
    private parent,
    private callback,
    private docComments: {[key: string]: string}
  ) {}

  run() {
    let debugInf: any;
    let input = this.parent;
    let key = this.elementData.name;
    let regions = opts.currentRegions;

    const mainData = input[key];
    debugInf = input._debug[`_m_${key}`];

    if (mainData == undefined) return;
    this.docComments ??= {};
    const merged = mergeData(debugInf, mainData, key, [], this.elementData.regionPath, this.docComments);

    const simple: ISimple = {
      start: merged.start,
      end: merged.end,
      name: merged.name,
      content: merged.content,
      // subRegions: []
    };

    const docComment = Array.isArray(this.parent) ? this.docComments[this.parent.map(p => p.type).join(".")] : this.docComments[this.parent.constructor.name];
    if (docComment) {
      simple.doc = docComment;
    }

    if (merged.strippedSubRegions) {
      simple.subRegions = merged.strippedSubRegions;
      delete merged.strippedSubRegions;
    }

    let r = regions;
    let rp = this.elementData.regionPath.split(",");
    for (let i = 0; i < rp.length - 1; i++) {
      r = r[parseInt(rp[i])]
      rp[i] = r.name;
      if (r.subRegions) {
        r = r.subRegions;
      } else if (!Array.isArray(r)) {
        console.error("somehow didn't do regions right...")
        console.log(r);
        console.log(rp);
        return merged;
      }
    }

    r[parseInt(rp.pop())] = simple;
    opts.callback(regions);

    return merged;
  }
}

