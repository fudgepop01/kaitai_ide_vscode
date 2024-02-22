import * as vscode from "vscode";
import KaitaiStream from "kaitai-struct/KaitaiStream";
import * as nls from "vscode-nls";
import KaitaiCompiler, {
  KSCompileResult,
  KSCompilerSupportedLanguage,
  YamlImporter,
} from "./ksc-typescript/kaitai-struct-compiler-js-fastopt";
import * as path from "path";
import { CachedImporter } from "./util/yamlImporter";
import { Logger } from "./logger";
import { safeLoad as safeLoadYaml } from "js-yaml";
import { readFileSync } from "fs";
import { snakeToCamel } from "./util/convertToCamelcase";
import { flattenObj } from "./util/flattenObject";

const localize = nls.loadMessageBundle();

export type KSParseFunction = (streamClass: typeof KaitaiStream) => new (stream: KaitaiStream) => unknown;

export interface LoadedKsyFile {
  resource: vscode.Uri;
  parsedKsy: unknown;
  yamlImporter: YamlImporter;
}

export class KSEngine {
  private compiler: KaitaiCompiler = new KaitaiCompiler();
  public constructor(private readonly logger: Logger) {};
  
  public docComments: {[key: string]: string} = {};
  public async loadKsyFile(resource: vscode.Uri): Promise<LoadedKsyFile> {
    this.docComments = {};

    if (!resource.fsPath.endsWith(".ksy")) {
      const message = localize(
        "onFileNotKsy",
        "The specified file is not a ksy file."
      );
      const err = new Error(message);
      err.name = "FileNotKsyError";
      throw err;
    }

    const loadedKsyFilesByPath: Record<string, unknown> = {};

    const loadRecursively = (filePath: string) => {
      const rawKsy = readFileSync(filePath, "utf8");

      if (loadedKsyFilesByPath[filePath]) {
        return loadedKsyFilesByPath[filePath];
      } else {
        try {
          const parsedYaml = safeLoadYaml(rawKsy);
          loadedKsyFilesByPath[filePath] = parsedYaml;
          const flattened: {[key: string]: string} = flattenObj(parsedYaml);
          for (const [key, val] of Object.entries(flattened)) {
            if (key.endsWith("doc")) this.docComments[key.substring(0, key.length - 4)] = val.trim();
          }
          if (parsedYaml?.meta?.imports) {
            for (const rawPath of parsedYaml.meta.imports as string[]) {
              const importPath = path
                .join(path.dirname(filePath), rawPath + ".ksy")
                .normalize();

              loadRecursively(importPath);
            }
          }

          return parsedYaml;
        } catch (e) {
          // We probably shouldn't throw here and cause the whole operation to fail
          this.logger.log("Error parsing KSY file", e);
          console.error("Error parsing KSY file:", e);
          vscode.window.showErrorMessage(`Error parsing KSY file: ${e}`);
        }
      }
    };

    const parsedKsy = loadRecursively(resource.fsPath);
    const yamlImporter = new CachedImporter(loadedKsyFilesByPath);
    return {
      resource,
      parsedKsy: parsedKsy as unknown,
      yamlImporter: yamlImporter,
    };
  }

  public async compileFunction(
    parsedKsy: LoadedKsyFile,
    debugMode: boolean = true
  ): Promise<KSParseFunction> {
    let compiled: KSCompileResult | null;
    compiled = await this.compiler.compile(
      "javascript",
      parsedKsy.parsedKsy,
      parsedKsy.yamlImporter,
      debugMode
    );
    for (const [name, out] of Object.entries(compiled)) {
      compiled[name] = out
        .replace(
          /(( +)this\._debug\.([a-zA-Z0-9]+)\.end = this\._io\.pos;)/g,
          "$1\n$2this._debug.$3.bitEnd = (8 - this._io.bitsLeft) % 8;"
        )
        .replace(
          /(( +)this\._debug\.([a-zA-Z0-9]+) = .+)/g,
          "$1\n$2this._debug.$3.bitStart = (8 - this._io.bitsLeft) % 8;"
        );
    }

    let fnBuilder = "";
    let mainClassName = path
      .basename(
        parsedKsy.resource.fsPath,
        path.extname(parsedKsy.resource.fsPath)
      )
      .toLowerCase();
    for (const [fileName, out] of Object.entries(compiled)) {
      const className = path.basename(fileName, path.extname(fileName));

      // Kaitai class names don't always match the file name's casing.
      // So if we find a file that has different casing, we'll use that casing instead.
      if (
        mainClassName.localeCompare(className, undefined, {
          sensitivity: "accent",
        }) === 0 &&
        mainClassName !== className
      )
        mainClassName = className;

      const codeStartIdx = out.indexOf(`var ${className}`);
      const codeEndIdx = out.lastIndexOf(`return ${className}`);
      fnBuilder += `\r\n${out.substring(codeStartIdx, codeEndIdx)}\r\n`;
    }
    mainClassName = snakeToCamel(mainClassName);

    console.log("Determined the Kaitai class name:", mainClassName);
    return <KSParseFunction>(
      new Function("KaitaiStream", `${fnBuilder}\r\nreturn ${mainClassName};`)
    );
  }

  public compileTo(
    language: KSCompilerSupportedLanguage,
    parsedKsy: LoadedKsyFile,
    debugMode: boolean = false
    ): Promise<KSCompileResult> {
    return this.compiler.compile(
      language,
      parsedKsy.parsedKsy,
      parsedKsy.yamlImporter,
      debugMode
    );
  }

  public async safeLoadAndCompileFunction(
    resource: vscode.Uri,
    debugMode: boolean = false
  ): Promise<KSParseFunction | null> {
    if (resource && !resource.fsPath.endsWith(".ksy")) {
      const message = localize(
        "onFileNotKsy",
        "The specified file is not a ksy file."
      );
      await vscode.window.showErrorMessage(message);
      return null;
    }

    let parsedKsy: LoadedKsyFile | null = null;
    try {
      parsedKsy = await this.loadKsyFile(resource);
    } catch (e) {
      vscode.window.showErrorMessage(`Error parsing KS definition: ${e}`);
      return null;
    }

    try {
      return await this.compileFunction(parsedKsy, debugMode);
    } catch (e) {
      this.logger.log("Error compiling KS definition into executable code.", e);
      console.error(e);
      if (typeof e === "object" && typeof e!["s$1"] === "string") {
        const typedError = e as {
          s$1: string;
          e$1: { s$1: string };
          stackTrace$1: string;
        };
        vscode.window.showErrorMessage(
          `${typedError.s$1}`
        );
      } else {
        vscode.window.showErrorMessage(
          `Error compiling KS definition into executable code: ${e}`
        );
      }
      return null;
    }
  }

  public async safeLoadAndCompileTo(
    language: KSCompilerSupportedLanguage,
    resource: vscode.Uri,
    debugMode: boolean = false
  ) {
    if (resource && !resource.fsPath.endsWith(".ksy")) {
      const message = localize(
        "onFileNotKsy",
        "The specified file is not a ksy file."
      );
      await vscode.window.showErrorMessage(message);
      return null;
    }

    let parsedKsy: LoadedKsyFile | null = null;
    try {
      parsedKsy = await this.loadKsyFile(resource);
    } catch (e) {
      vscode.window.showErrorMessage(`Error parsing KS definition: ${e}`);
      return null;
    }

    try {
      return await this.compileTo(language, parsedKsy, debugMode);
    } catch (e) {
      this.logger.log("Error compiling KS definition.", e);
      console.error(e);
      if (typeof e === "object" && typeof e!["s$1"] === "string") {
        const typedError = e as {
          s$1: string;
          e$1: { s$1: string };
          stackTrace$1: string;
        };
        vscode.window.showErrorMessage(
          `${typedError.s$1}: ${typedError.e$1.s$1} \ntrace:\n${typedError.stackTrace$1}`
        );
      } else {
        vscode.window.showErrorMessage(`Error compiling KS definition: ${e}`);
      }
      return null;
    }
  }
}
