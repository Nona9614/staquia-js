/**
 * Runs every spec once in the terminal, without the test portal, and exits with 1 if any test failed.
 * Used by CI: `pnpm run tests:ci` (the portal is `pnpm run tests`).
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import url from "node:url";
import { Specs } from "./shared/store.js";
import Spec from "./structures/test-spec.js";
import { setup } from "./decorators/test.decorator.js";

async function findSpecFiles(dirPath: string): Promise<string[]> {
  let files: string[] = [];
  for (const entry of await fs.readdir(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) files = files.concat(await findSpecFiles(fullPath));
    else if (entry.isFile() && (entry.name.endsWith(".spec.ts") || entry.name.endsWith(".test.ts"))) files.push(fullPath);
  }
  return files;
}

for (const file of await findSpecFiles(path.resolve("./tests/specs"))) {
  const module = await import(url.pathToFileURL(file).href);
  if (typeof module.default === "function" && module.default.prototype instanceof Spec) setup(new module.default());
}

// The report is HTML: the totals and every failed test with its message
const html: string = Specs.run().toHtml();
const [, passed = "0", total = "0"] = html.match(/\(Tests (\d+)\/(\d+)\)/) ?? [];
const failed = [...html.matchAll(/spec__test spec__status--failed[\s\S]*?spec__name">([\s\S]*?)<\/span>[\s\S]*?spec__message">([\s\S]*?)<\/span>/g)];
for (const [, name, message] of failed) console.error(`✗ ${name!.trim()}: ${message!.trim()}`);
console.log(`Tests ${passed}/${total}`);
process.exit(failed.length === 0 && passed === total && total !== "0" ? 0 : 1);
