// Contents of the file /rollup.config.js
import ts from 'rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json' assert { type: "json" };

/** Bases the paths to the `lib` folder */
function lib(...paths) {
  return paths.reduce((p, k) => p + `/${k}`, "lib")
}

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: lib(pkg.module),
        format: 'esm',
        sourcemap: true
      },
      {
        file: lib(pkg.main),
        format: 'cjs',
        sourcemap: true
      }],
    external: ["guardex", "lodash"],
    plugins: [ts(), copy({
      targets: [
        { src: 'README.md', dest: 'lib/' },
        { src: 'package.json', dest: 'lib/' },
      ]
    })]
  },
];
export default config;

