/** Generic function */
export type Func = (...args: any[]) => any;
/** Primitive values */
export type Primitive = Func | symbol | string | number | bigint | boolean;

/** Marks all fields from an object as required */
export type RequiredRecursive<T> = T extends Primitive
  ? Exclude<T, undefined>
  : {
      [P in keyof T]-?: RequiredRecursive<T[P]>;
    };
