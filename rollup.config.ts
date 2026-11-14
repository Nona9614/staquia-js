// Node JS
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import type { Mode, ObjectEncodingOptions, OpenMode } from "node:fs";
import type { Abortable } from "node:events";
// Rollup
import type { InputOptions, OutputOptions } from "rollup";
// Plugins
import { rollup, ts, pkg } from "./rollup.plugins.mjs";
import { dts } from "rollup-plugin-dts";
import { RollupTypescriptOptions } from "@rollup/plugin-typescript";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Checks if some filename ends with the extension of a sourcemap
 * -  .js.map
 * -  .mjs.map
 * -  .cjs.map
 * -  .ts.map
 * -  .mts.map
 * -  .cts.map
 * @param {string} filename The filename to be checked
 * @returns
 */
const isSourceMap = (filename: string) => /\.[cm]?[tj]s\.map$/giu.test(filename);

/** Bases the paths to the `lib` folder */
function lib(...paths: string[]) {
  return path.resolve(__dirname, "lib", ...paths);
}

/**
 * Uses the matcher to replace the placeholder values to each file passed
 * @param {{ version: string }} matcher The matcher to use on all files
 * @param {string[]} filenames The files to replace values
 */
async function replace(matcher: { version: string }, ...filenames: string[]) {
  for (const filename of filenames) {
    // Regex to match any word or digit that may be followed by a dash
    const rgx = /{([\w\d-]+)}/gi;
    // The file to be replaced
    let template = (await fs.readFile(filename, fsOptions)).toString();
    // Going throu each key pair and replace by selector
    const replaced = template.replace(rgx, function (match, selector: keyof typeof matcher) {
      // If the selector does not exists in the matcher
      // just return the same value
      const r = matcher[selector];
      return r == undefined ? match : r;
    });
    // Writes the replaced values
    await fs.writeFile(filename, replaced, fsOptions);
  }
}

/**
 * General rollup typescript options
 */
const tsOptions: RollupTypescriptOptions = {
  declaration: false,
  declarationDir: null,
};

/**
 * These options are meant to be used for `d.ts` code
 * such that the code is bundled but not minified
 */
const DTS_INPUT_OPTIONS: InputOptions = {
  input: "./src/export.ts",
  plugins: [dts()],
};

/**
 * These options are meant to be used for `d.ts` code.
 * Takes the name from the `module` property of the `package.json` file
 * and should not have sourcemaps when generated as they are not needed.
 */
const DTS_OUTPUT_OPTIONS: OutputOptions = {
  file: "index.d.ts",
  format: "esm",
  sourcemap: false,
};

/**
 * These options are meant to be used for `esm` code
 * such that the code is bundled but not minified.
 * ESM is the only format shipped by the library.
 */
const ESM_INPUT_OPTIONS: InputOptions = {
  input: "src/export.ts",
  plugins: [ts(tsOptions)],
};

/**
 * These options are meant to be used for `esm` code.
 * Matches the `exports` property of the `package.json` file
 * and should not have sourcemaps when generated as they are not needed.
 */
const ESM_OUTPUT_OPTIONS: OutputOptions = {
  format: "esm",
  sourcemap: false,
  dir: lib(),
  entryFileNames: "index.js",
};

interface BundleOptions {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

const fsOptions:
  | (ObjectEncodingOptions & {
      mode?: Mode | undefined;
      flag?: OpenMode | undefined;
      /**
       * If all data is successfully written to the file, and `flush`
       * is `true`, `filehandle.sync()` is used to flush the data.
       * @default false
       */
      flush?: boolean | undefined;
    } & Abortable)
  | BufferEncoding
  | null = {
  encoding: "utf-8",
};

/**
 * Bundles the typescript code and outpus it
 * @param {object} object
 * @param {import('rollup').InputOptions} object.inputOptions These are the options like which file to use as reference to bundle and th plugins to use
 * @param {import('rollup').OutputOptions} object.outputOptions These are options like where to output the file and its name
 */
async function bundler({ inputOptions, outputOptions }: BundleOptions) {
  const bundle = await rollup(inputOptions);
  const { output } = await bundle.generate(outputOptions);
  for (const _ of output) {
    // Actual code to be bundled
    if (_.type === "chunk") {
      // Writing code to its file
      const name = lib(outputOptions.file ?? (outputOptions.entryFileNames! as string));
      await fs.writeFile(name, _.code, fsOptions);
      if (_.map) {
        // Write maps if enabled
        await fs.writeFile(`${name}.map`, JSON.stringify(_.map), fsOptions);
      }
    } else {
      // Write the not chunk content
      if (isSourceMap(_.fileName)) continue;
      // Write any other asset to the lib that is not a source map
      const name = lib(_.fileName);
      await fs.writeFile(name, _.source, fsOptions);
    }
  }
  // Finishes bundle session
  await bundle.close();
}

async function build() {
  /**
   * Creates an array containing all the options to
   * render all the formats
   */
  const formats: BundleOptions[] = [
    { inputOptions: DTS_INPUT_OPTIONS, outputOptions: DTS_OUTPUT_OPTIONS },
    { inputOptions: ESM_INPUT_OPTIONS, outputOptions: ESM_OUTPUT_OPTIONS },
  ];

  // Bundles all the formats
  for (let i = 0; i < formats.length; i++) {
    // Bundles each of the formats
    await bundler(formats[i]);
  }
}

async function bundle() {
  // Clears folder and rebuild
  // Emptying folder before start
  await fs.rm(lib(), {
    force: true,
    recursive: true,
  });
  await fs.mkdir(lib());
  // Copies static files
  const root = (...paths: string[]) => path.resolve(__dirname, ...paths);
  const copy = (filename: string, from: string, to: string) => fs.copyFile(path.resolve(from, filename), path.resolve(to, filename));
  await copy("package.json", root(), lib());
  await copy("README.md", root(), lib());
  await copy("LICENCE", root(), lib());
  // Builds the formats to the distribution folder and copies the no code content
  await build();
  // Update version to documentations
  await replace({ version: pkg.version }, lib("README.md"));
}

try {
  await bundle();
} catch (error) {
  console.error(error);
}
