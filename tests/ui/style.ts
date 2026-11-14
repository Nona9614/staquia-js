import fs from "node:fs/promises";
import path from "node:path";
import { htmlAsync as html } from "./html.js";
import { __root } from "../constants.js";

const style = async () => {
  const route = path.resolve(__root, "ui", "styles.css");
  const styles = await fs.readFile(route, "utf-8");
  return html`
    <style>
      ${styles}
    </style>
  `;
};

export default style;
