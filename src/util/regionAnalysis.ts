import { nestedGetter } from './nestedPropertyMethods';

const eager = true;

interface ISimple {
  start: number;
  end: number;
  name: string;
  content?: any;
  subRegions?: any;
}

const mergeData = (debugData: any, mainData: any, dataName: string) => {

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
      for (const entry of mainData) {
        let data = analyzeStructure(entry);

        out.subRegions.push(data.fullData);
        out.strippedSubRegions.push(...data.regionData);
      }
    }
  }
  else  {
    // we're dealing with another object
    const data = analyzeStructure(mainData);
    out.subRegions = data.fullData;
    out.strippedSubRegions = data.regionData;
  }

  return out;
}



export const analyzeStructure = (input: any) => {
  const regionData = [];
  const fullData = [];

  function dataRoutine(key: string, isInstance: boolean) {
    let debugInf: any;

    const mainData = input[key];
    if (isInstance) debugInf = input._debug[`_m_${key}`];
    else debugInf = input._debug[key];

    const merged = mergeData(debugInf, mainData, key);

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
    if (["constructor", "_read"].includes(key)) continue;
    if (eager) {
      dataRoutine(key, true);
    }
    else {
      fullData.push({
        type: "__instance",
        name: key
      })
    }
  }

  return {
    regionData,
    fullData
  }
}