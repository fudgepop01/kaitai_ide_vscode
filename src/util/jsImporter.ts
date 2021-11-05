import { platform } from "os";

class Importer {

  public yamlFiles: {
    [key: string]: string;
  }
  constructor(files) {
    this.yamlFiles = files;
  }

  setLoadedPaths(paths: any) {
    this.yamlFiles = paths;
  }

  async importYaml(name: string, mode: "abs"|"rel") {
    for (let [fName, yaml] of Object.entries(this.yamlFiles)) {
      if (platform() === 'win32') fName = fName.replace(/\//g, '\\');
      if (fName.endsWith(`${name}.ksy`)) return yaml;
    }
  }
}

export default Importer;