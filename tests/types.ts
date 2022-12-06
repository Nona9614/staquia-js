export type System = {
  first: string;
  last: string;
  zero: string;
  ϰ: number;
  segments: {
    n: number;
    z: number;
  };
};

type GeneralTest<T, E> = {
  _id: string,
  skip: boolean;
  items: Array<
    {
      skip: boolean;
      expected: E;
      message: string;
    } & T
  >;
};

type PositionObject = {
  n: string;
  z: string;
};

type After = GeneralTest<
  {
    _id: {

    },
    value: string
  },
  string
>;

type Before = GeneralTest<
  {
    _id: {

    },
    value: string
  },
  string
>;

type Between = GeneralTest<
  {
    _id: {

    },
    before: string,
    after: string,
    round: boolean
  },
  string
>;

type Diverge = GeneralTest<
  {
    _id: {

    },
    before: string,
    after: string
  },
  string
>;

type Criteria = GeneralTest<
  {
    _id: {

    },
    value: string,
    before: string,
    after: string
  },
  boolean
>;

type Core = GeneralTest<
  {
    _id: {

    },
    before: string,
    after: string
  },
  string
>;

type Previous = GeneralTest<
  {
    _id: {

    },
    value: string
  },
  string
>;

type Next = GeneralTest<
  {
    _id: {

    },
    value: string
  },
  string
>;

type ToObject = GeneralTest<
  {
    _id: {

    },
    value: string
  },
  object
>;

type ToString = GeneralTest<
  {
    _id: {

    },
    value: {
      n: string,
      z: string
    }
  },
  string
>;


export type TestAlgorithm = "after" | "before" | "between" | "diverge" | "criteria";
export type TestPosition = "core" | "previous" | "next" | "toObject" | "toString";
export type TestName = TestAlgorithm | TestPosition;

export const isAlgorithmTest = (value: string): value is TestAlgorithm => value === "after" || value === "before" || value === "between" || value === "diverge" || value === "criteria"
export const isPositionTest = (value: string): value is TestPosition => value === "core" || value === "previous" || value === "next" || value === "toObject" || value === "toString"

export type Test<T extends TestName> = T extends 'after' ? After : T extends 'before' ? Before : T extends 'between' ? Between : T extends 'diverge' ? Diverge : T extends 'criteria' ? Criteria : T extends 'core' ? Core : T extends 'previous' ? Previous : T extends 'next' ? Next : T extends 'toObject' ? ToObject : T extends 'toString' ? ToString : never;

type UnArray<T> = T extends Array<infer U> ? U : T;
export type Callback<T extends TestName> = (
  this: Mocha.Context,
  item: UnArray<Test<T>["items"]>
) => void;

export type Spies = { [T in TestName]: Test<T> };
