import { nestedGetter } from './nestedPropertyMethods';

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
}

interface ICircleCheck {
  start: number;
  type: string;
  name: string;
  regionPath: string;
}

const mergeData = (debugData: any, mainData: any, dataName: string, parents: ICircleCheck[], regionNum: number | string) => {

  let out = {
    start: debugData.start + debugData.ioOffset,
    end: debugData.end + debugData.ioOffset,
    ioOffset: debugData.ioOffset,
    name: dataName,
    array: false,
    type: mainData.constructor.name,
    subRegions: null,
    strippedSubRegions: null,
    content: null
  };

  // prevents circular references on initial compile (important for eager mode)
  // also allows for keeping track of the index of an array entry
  let existingIndex = parents.map(({start, type}) => JSON.stringify({start, type})).indexOf(JSON.stringify({start: out.start, type: out.type}));
  if (existingIndex != -1 ) {
    // return from circular here
    return {
      ...out,
      start: NaN,
      end: NaN,
      type: '[circular] - ' + parents.slice(0, existingIndex + 1).map(({name}) => name).join('/')
    }
  } else {
    // sets subregion path here
    let lastRegionPath = '';
    if (parents.length != 0) lastRegionPath = parents[parents.length - 1].regionPath + ',';
    parents.push({start: out.start, type: out.type, name: out.name, regionPath: `${lastRegionPath}${regionNum}`});
  }


  if (typeof mainData !== "object" || mainData instanceof Uint8Array) {
    // contents are a primitive type
    out.content = mainData;
    out.array = false;
  }
  else if (Array.isArray(mainData)) {
    // we're dealing with an array of data
    out.array = true;
    out.type = mainData[0].constructor.name;

    if (typeof mainData[0] !== "object" || mainData[0] instanceof Uint8Array) {
      // array consists of primitives

      let size = debugData.end - debugData.start;
      let offsetTracker = (size / mainData.length);
      out.subRegions = (mainData as any[]).map((val: any, index: number) => {
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

      let lastRegionPath = '';
      if (parents.length != 0) lastRegionPath = parents[parents.length - 1].regionPath + ',';
      for (const [idx, entry] of mainData.entries()) {
        parents.push({name: `${idx}`, type: entry.constructor.name, regionPath: `${lastRegionPath}${idx}`, start: -1})
        let data = analyzeStructure(entry, parents);
        parents.pop();

        out.subRegions.push(data.fullData);
        out.strippedSubRegions.push(...data.regionData);
      }
    }
  }
  else  {
    // we're dealing with another object
    const data = analyzeStructure(mainData, parents);
    out.subRegions = data.fullData;
    out.strippedSubRegions = data.regionData;
  }

  parents.pop()
  return out;
}

export const analyzeStructure = (input: any, parents?: ICircleCheck[]) => {
  if (!parents) parents = [];

  const regionData = [];
  const fullData = [];

  function dataRoutine(key: string, isInstance: boolean) {
    let debugInf: any;

    const mainData = input[key];
    if (isInstance) debugInf = input._debug[`_m_${key}`];
    else debugInf = input._debug[key];

    if (mainData == undefined || key.startsWith('_m_')) return;
    const merged = mergeData(debugInf, mainData, key, parents, regionData.length);

    const simple: ISimple = {
      start: merged.start,
      end: merged.end,
      name: merged.name,
      content: merged.content
    };

    if (merged.strippedSubRegions) {
      simple.subRegions = merged.strippedSubRegions;
      delete merged.strippedSubRegions;
    }

    regionData.push(simple);
    fullData.push(merged);
  }

  // find / get sequence
  for (const key of Object.keys(input._debug)) {
    if (key === 'arr') continue;
    else {
      dataRoutine(key, false);
    }
  };

  // find / get instances
  for (const key of Reflect.ownKeys(input.__proto__).map(k => k.toString())) {
    if (["constructor", "_read"].includes(key) || key.startsWith('_m_')) continue;
    if (opts.eager) {
      if (input[key] == undefined) continue;
      if (input.constructor.name !== input[key].constructor.name) dataRoutine(key, true);
      else {
        // prevents indefinitely recursive types from parsing infinitely (ex. linked lists)
        let toPush = {
          type: "[rec]",
          name: key,
          analysisLeaf: null,
          regionPath:
            (parents.length > 0)
            ? `${parents[parents.length - 1].regionPath},${regionData.length}`
            : `${regionData.length}`
        }
        toPush.analysisLeaf = new analysisLeaf(toPush, input, opts.callback);
        regionData.push({start: NaN, end: NaN, name: '', content: ''});
        fullData.push(toPush);
      }
    }
    else {
      // enables the continuation of parsing on command
      let toPush = {
        type: "[instance]",
        name: key,
        analysisLeaf: null,
        regionPath:
          (parents.length > 0)
          ? `${parents[parents.length - 1].regionPath},${regionData.length}`
          : `${regionData.length}`
      }
      // the callback is necessary to update the region data
      toPush.analysisLeaf = new analysisLeaf(toPush, input, opts.callback);
      regionData.push({start: NaN, end: NaN, name: '', content: ''});
      fullData.push(toPush);
    }
  }

  return {
    regionData,
    fullData
  }
}

export class analysisLeaf {
  constructor(
    private elementData,
    private parent,
    private callback
  ) {}

  run() {
    let debugInf: any;
    let input = this.parent;
    let key = this.elementData.name;
    let regions = opts.currentRegions;

    const mainData = input[key];
    debugInf = input._debug[`_m_${key}`];

    if (mainData == undefined) return;
    const merged = mergeData(debugInf, mainData, key, [], this.elementData.regionPath);

    const simple: ISimple = {
      start: merged.start,
      end: merged.end,
      name: merged.name,
      content: merged.content
    };

    if (merged.strippedSubRegions) {
      simple.subRegions = merged.strippedSubRegions;
      delete merged.strippedSubRegions;
    }

    let r = regions;
    let rp = this.elementData.regionPath.split(",");
    for (let i = 0; i < rp.length - 1; i++) {
      r = r[parseInt(rp[i])]
      if (r.subRegions) r = r.subRegions;
      else {
        console.error("somehow didn't do regions right...")
        console.log(r);
        return merged;
      }
    }

    r[parseInt(rp.pop())] = simple;
    opts.callback(regions);

    return merged;
  }
}