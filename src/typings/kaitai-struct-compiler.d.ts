declare module "kaitai-struct-compiler/kaitai-struct-compiler" {
    // Based on 0.9.0

    export interface YamlImporter {
        /**
         * 
         * @param name The name of the referenced yaml type. May contain directory navigation statements like `../`.
         * @param mode 
         */
        importYaml(name: string, mode: "rel" | "abs"): Promise<unknown>;
    }

    export type KSCompilerSupportedLanguage = "construct" | "cpp_stl" | "csharp" | "graphviz" | "go" | "html" | "java" | "javascript" | "lua" | "nim" | "perl" | "php" | "python" | "ruby";

    export interface KSCompileResult {
        [file: string]: string;
    }

    export default class KaitaiStructCompiler {
        public get version(): string;
        public get buildDate(): string;
        public get languages(): string[];

        public constructor();

        /**
         * 
         * @param language The language to compile to.
         * @param parsedKsy The parsed KSY yaml object.
         * @param yamlImporter Allows the compiler to parse referenced .ksy files.
         * @param debugMode Defaults to false.
         */
        public compile(language: KSCompilerSupportedLanguage, parsedKsy: unknown, yamlImporter: YamlImporter, debugMode?: boolean): Promise<KSCompileResult>;
    }
}