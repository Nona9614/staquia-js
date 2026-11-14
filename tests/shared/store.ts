import TestGroup from "../structures/test-group.ts";
import TestSpecs from "../structures/test-specs.ts";
import Uuid from "./uuid.ts";

export const SpecId = new Uuid();

export const Groups = new Map<string, TestGroup>();
export const Specs = new TestSpecs();
