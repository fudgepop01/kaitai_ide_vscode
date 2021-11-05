const chalk = require("chalk");
const { build } = require("esbuild");

const watchFlag = process.argv?.includes("--watch") == true;

build({
  bundle: true,
  minify: false,
  plugins: [
    {
      name: 'Test',
      setup(build) {
        build.onStart(() => {
          console.log("Build starting...");
        })
      }
    }
  ],
  watch: watchFlag
    ? {
        onRebuild(error, result) {
          if (error) console.log("Build " + chalk.red("failed") + ".");
          else console.log("Build " + chalk.green("completed") + ".");
        },
      }
    : false,
  entryPoints: ["./src/extension.ts"],
  outdir: "dist",
  platform: "node",
  sourcemap: true,
  external: ["vscode"],
})
  .then((result) => {
    let buildFinishMessage = `Build ${chalk.green("completed")}`;
    const numOfWarnings = (result.warnings && result.warnings.length) || 0;
    if (numOfWarnings) {
      let warningText = chalk.yellow(
        numOfWarnings == 1 ? "warning" : "warnings"
      );
      buildFinishMessage += ` with ${chalk.whiteBright(
        numOfWarnings
      )} ${warningText}`;
    }
    if (watchFlag) {
      // "Build completed with [x] warning(s)"
      buildFinishMessage += ". Watching files for changes...";
    } else {
      // "Build completed"
      buildFinishMessage += ".";
    }
    console.log(buildFinishMessage);
  })
  .catch((result) => {
    let buildFinishMessage = `Build ${chalk.red("failed")}`;
    const numOfErrors = (result.errors && result.errors.length) || 0;
    const numOfWarnings = (result.warnings && result.warnings.length) || 0;
    if (numOfErrors) {
      let errorNoun = numOfErrors == 1 ? "error" : "errors";
      buildFinishMessage += ` with ${chalk.whiteBright(
        numOfErrors
      )} ${chalk.red(errorNoun)}`;
    }
    if (numOfWarnings) {
      let warningNoun = numOfWarnings == 1 ? "warning" : "warnings";
      if (numOfErrors) {
        // "Build failed with [x] errors(s) and [y] warning(s)"
        buildFinishMessage += ` and ${chalk.whiteBright(
          numOfWarnings
        )} ${chalk.yellow(warningNoun)}`;
      } else {
        // "Build failed with [x] warning(s)"
        buildFinishMessage += ` with ${chalk.whiteBright(
          numOfWarnings
        )} ${chalk.yellow(warningNoun)}`;
      }
    }
    if (watchFlag) {
      buildFinishMessage += `. ${chalk.italic(
        "Watch canceled due to error on initial build."
      )}`;
    } else {
      buildFinishMessage += ".";
    }
    console.error(buildFinishMessage);
    process.exit(1);
  });
