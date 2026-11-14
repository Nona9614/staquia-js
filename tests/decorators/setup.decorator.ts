export type SetupMethod = () => void & {
  symbol: Symbol;
};

/**
 * Symbol used to identify a function as a test method.
 */
export const symbol = Symbol("Setup Method");

/**
 * Verifies if some value can be considered as a `SetupMethod`.
 * @param value The object marked as setup method
 * @returns `true` if it is a setup method if not `false`.
 */
export const isSetupMethod = (value: any): value is SetupMethod =>
  value && typeof value === "function" && value.symbol && value.symbol === symbol;

/**
 * Decorator `@test` marks the function inside a class with the `@essay` decorator
 * as a test to be run.
 */
export default function setup(target: () => void, context: ClassMethodDecoratorContext, descriptor?: PropertyDescriptor) {
  (context.metadata as any)[symbol] ??= target;
}
