// Contents of the file /rollup.config.js
import ts from 'rollup-plugin-ts';
import copy from 'rollup-plugin-copy';

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: 'src/index.ts',
    output: {
      name: 'staquia.js',
      dir: 'lib',
      format: 'cjs',
      exports: 'named'
    },
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

