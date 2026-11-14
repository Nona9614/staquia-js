import url from "node:url";
import path from "node:path";

export const __root = path.dirname(url.fileURLToPath(import.meta.url));
