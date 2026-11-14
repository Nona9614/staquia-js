// Node JS
import process from "node:process";
// Express
import express from "express";
// UI
import ui from "./ui/ui.js";
// Spec
import { Specs } from "./shared/store.js";

// Setup Tests
import fs from "fs/promises";
import path from "path";
import url from "url";
import Spec from "./structures/test-spec.js";
import { setup } from "./decorators/test.decorator.js";

/**
 * Main runner function to load and instantiate matching spec classes
 */
{
  /**
   * Recursively search a directory for files ending with .spec.ts
   */
  async function findSpecFiles(dirPath: string) {
    let specFiles: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        specFiles = specFiles.concat(await findSpecFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith(".spec.ts") || entry.name.endsWith(".test.ts"))) {
        specFiles.push(fullPath);
      }
    }

    return specFiles;
  }

  // Point this to your test directory
  const targetDir = "./tests/specs";
  const absolutePath = path.resolve(targetDir);
  const specFilePaths = await findSpecFiles(absolutePath);

  for (const filePath of specFilePaths) {
    try {
      // Convert file path to a file:// URL for dynamic import in Node.js
      const fileUrl = url.pathToFileURL(filePath).href;
      const module = await import(fileUrl);

      const DefaultExport = module.default;

      // Verify if the default export exists, is a function (class), and extends Spec
      if (typeof DefaultExport === "function" && DefaultExport.prototype instanceof Spec) {
        console.log(`Found Spec: ${DefaultExport.name} in ${path.basename(filePath)}`);
        // Generate an instance
        setup(new DefaultExport());
      }
    } catch (err) {
      console.error(`Failed to load or process file ${filePath}:`);
      console.error(err);
      process.exit();
    }
  }
}

// Setup Server
const app = express();
app.use(express.json());
const port = Number(process.env.PORT);

app.get("/", async (_, res) => {
  res.setHeader("Content-Type", "text/html");
  const html = await ui();
  res.send(html);
});

app.get("/specs", async (_, res) => {
  res.setHeader("Content-Type", "text/html");
  const html = Specs.run().toHtml();
  res.send(html);
});

app.listen(port, () => {
  console.log(`Test portal at http://localhost:${port}`);
});
