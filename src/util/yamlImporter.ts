import type { YamlImporter } from "kaitai-struct-compiler/kaitai-struct-compiler"

export class CachedImporter implements YamlImporter {
  public yamlFiles: Record<string,unknown>

  constructor(files: Record<string,unknown>) {
    this.yamlFiles = files;
  }

  setLoadedPaths(paths: Record<string,unknown>) {
    this.yamlFiles = paths;
  }

  async importYaml(name: string, mode: "abs"|"rel") {
    for (let [fName, yaml] of Object.entries(this.yamlFiles)) {
      if (fName.endsWith(`${name}.ksy`)) return yaml;
    }
  }
}