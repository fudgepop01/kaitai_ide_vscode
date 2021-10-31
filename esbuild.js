const { build } = require("esbuild");

const watchFlag = process.argv?.includes("--watch") == true;

build({
  bundle: true,
  minify: false,
  watch: watchFlag
    ? {
        onRebuild(error, result) {
          if (error) console.error("Watch rebuild failed.");
          else console.log("Watch rebuild succeeded.");
        },
      }
    : false,
  entryPoints: ["./src/extension.ts"],
  outdir: "dist",
  platform: "node",
  sourcemap: true,
  external: [ "vscode" ],
})
  .then((result) => {
    if (watchFlag) {
      console.log("Watching files for changes...");
    } else {
      console.log("Build complete.");
    }
  })
  .catch((e) => {
    console.error("build failed:", e);
    // process.exit(1);
  });
