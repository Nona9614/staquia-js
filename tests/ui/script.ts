import fs from "node:fs/promises";
import path from "node:path";
import { htmlAsync as html } from "./html.js";
import { __root } from "../constants.js";

const script = async () => {
  const localhost = `"http://localhost:${process.env.PORT}"`;
  const code = await fs.readFile(path.resolve(__root, "ui", "script.mjs"));
  return html`
    <script type="module">
      window.localhost = ${localhost};
      ${code};
    </script>
  `;
};

export default script;
