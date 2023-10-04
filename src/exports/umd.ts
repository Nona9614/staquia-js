import _, { Staquia } from "../staquia";
import { Position } from "../position";

// Especial export for UMD libraries and CDN
const staquia = { ..._, Position, Staquia };
export default staquia;
