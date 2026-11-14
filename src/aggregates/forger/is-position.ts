import IPosition from "../../interfaces/position.js";

const isPosition = (position: any): position is IPosition => position.digits;
export default isPosition;
