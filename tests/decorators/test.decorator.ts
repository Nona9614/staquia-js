// Shared
import { Groups, Specs } from "../shared/store.js";
// Structures
import TestMethod from "../structures/test-method.js";
import Spec from "../structures/test-spec.js";
import TestGroup from "../structures/test-group.js";
// Decorators
import { symbol } from "./setup.decorator.js";

/**
 * Symbol used to identify a function as a test method.
 */
export const method = Symbol("Test Method");

/**
 * Verifies if some value can be considered as a `SetupMethod`.
 * @param value The object marked as setup method
 * @returns `true` if it is a setup method if not `false`.
 */
export const isTestMethod = (value: any): value is () => void =>
  value && typeof value === "function" && value.symbol && value.symbol === method;

export interface TestMethodMetadata {
  target: () => void;
  name: string;
  group?: string;
  description: string;
}

/**
 * Marks a class method as a test to be executed.
 *
 * @param description - The message or description to display when running this test.
 * @param group - Optional group name used to categorize the test.
 */
export default function test(description: string, group?: string) {
  return function (target: () => void, context: ClassMethodDecoratorContext, descriptor?: TypedPropertyDescriptor<any>): void {
    (context.metadata as any)[method] ??= new Array<TestMethodMetadata>();
    (context.metadata as any)[method].push({ target, name: target.name, description, group });
  };
}

export const setup = (instance: Spec) => {
  const spec = Specs.find(instance.id);
  if (!spec) return spec;
  const constructor = instance.constructor as any;
  const sm = Symbol.for("Symbol.metadata");
  const meta = constructor[sm]
  const tests: TestMethodMetadata[] = meta[method];

  for (const metadata of tests) {
    const name = metadata.group ?? "(anonyomous)";
    const groupId = name + "@" + spec.id;

    let group = Groups.get(groupId);
    if (!group) {
      group = new TestGroup(spec.id, name);
      Groups.set(groupId, group);
      spec.add(group);
    }

    const test = new TestMethod(metadata.target, instance, metadata.name, metadata.description);
    group.add(test);
  }

  const setup = meta[symbol];
  if (setup && typeof setup === "function") setup.call(instance);

  constructor[sm] = undefined!;
};
