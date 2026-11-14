type Func = (...args: any) => any;
export type MockValue<T> = T extends string | number | boolean | Func ? T : Partial<T>;

/** Default not operational function */
export const noop =
  (result?: any) =>
  (..._: any) =>
    result;

/**
 * Mocks a generic object and assign all default passed properties
 */
const mock = <T>(value?: MockValue<T>): T => {
  let mock: unknown;

  const type = typeof value;
  if (type === "function") {
    mock = value ?? noop();
  } else if (type === "boolean") {
    mock = value ?? false;
  } else if (type === "number") {
    mock = value ?? 0;
  } else if (type === "string") {
    mock = value ?? null;
  } else {
    if (value) {
      Object.assign((mock = {}), value);
    }
  }

  return mock as T;
};

export default mock;
