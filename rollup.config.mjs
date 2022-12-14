// Contents of the file /rollup.config.js
import { empty, resolve, writeSync } from "xufs";
import { rollup } from "rollup";
import ts from 'rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json' assert { type: "json" };

/** Bases the paths to the `lib` folder */
function lib(...paths) {
  return resolve("lib", ...paths);
}

/** @type {import('rollup').InputOptions} */
const inputOptions = {
  input: "src/index.ts",
  external: ["guardex"],
  plugins: [ts(), copy({
    targets: [
      { src: 'README.md', dest: lib("") },
      { src: 'package.json', dest: lib("") },
    ]
  })]
};

/** @type {import('rollup').OutputOptions[]} */
const outputOptions = [
  {
    file: lib(pkg.module),
    format: 'esm',
    sourcemap: true,
  },
  {
    file: lib(pkg.main),
    format: 'cjs',
    sourcemap: true
  }]

const isDeclarationFile = (filename) => /\.d\.[mc]ts$/gui.test(filename);
const isSourceMap = (filename) => /\.[cm]?[tj]s\.map$/gui.test(filename);

export async function build() {
  let isTypesBundledAlready = false;
  // Wmptying folder before start
  await empty(lib(), true)
  // Creating bundle instance
  const bundle = await rollup(inputOptions);
  for (const outputOption of outputOptions) {
    const { output } = await bundle.generate(outputOption);
    for (const _ of output) {
      if (_.type === "chunk") {
        // Writing code to its file
        writeSync(outputOption.file, _.code);
        if (_.map) {
          // Write maps if enabled
          const name = `${outputOption.file}.map`;
          writeSync(name, JSON.stringify(_.map));
        }
      } else {
        // Write only once the declaration file
        if (isDeclarationFile(_.fileName)) {
          if (!isTypesBundledAlready) {
            const name = lib(_.fileName.replace(/[mc]ts$/, "ts"));
            writeSync(name, _.source);
            isTypesBundledAlready = true;
          } else continue;
        } else if (!isSourceMap(_.fileName)) {
          // Write any other asset to the lib that is not a source map
          const name = lib(_.fileName);
          writeSync(name, _.source);
        }
      }
    }
  }
  // Write to disk
  // writeSync(config.output.file, chunk);
  // Finishes bundle session
  await bundle.close();
}

build();
