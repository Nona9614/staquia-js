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
    _id: string,
    value: string
  },
  string
>;

type Before = GeneralTest<
  {
    _id: string,
    value: string
  },
  string
>;

type Between = GeneralTest<
  {
    _id: string,
    before: string,
    after: string,
    round: boolean
  },
  string
>;

type Diverge = GeneralTest<
  {
    _id: string,
    before: string,
    after: string
  },
  string
>;

type Criteria = GeneralTest<
  {
    _id: string,
    value: string,
    before: string,
    after: string
  },
  boolean
>;

type OnThreshold = GeneralTest<
  {
    _id: string,
    before: string,
    next: string,
    trigger: string
  },
  boolean
>;

type OnOverflow = GeneralTest<
  {
    _id: string,
    before: string,
    next: string,
    trigger: string
  },
  boolean
>;

type Core = GeneralTest<
  {
    _id: string,
    before: string,
    after: string
  },
  string
>;

type Previous = GeneralTest<
  {
    _id: string,
    value: string
  },
  string
>;

type Next = GeneralTest<
  {
    _id: string,
    value: string
  },
  string
>;

type ToObject = GeneralTest<
  {
    _id: string,
    value: string
  },
  object
>;

type ToString = GeneralTest<
  {
    _id: string,
    value: {
      n: string,
      z: string
    }
  },
  string
>;

type ToEquals = GeneralTest<
  {
    _id: string,
    value: {
      n: string,
      z: string
    },
    equals: string
  },
  boolean
>;

type ValueOf = GeneralTest<
  {
    _id: string,
    before: string,
    after: string,
    greater: boolean
  },
  boolean
>;

type Update = GeneralTest<
  {
    _id: string,
    original: string,
    update: string
  },
  string
>;

type IsPosition = GeneralTest<
  {
    _id: string,
    value: {
      n: string,
      z: string
    }
  },
  boolean
>;

type IsPositionObject = GeneralTest<
  {
    _id: string,
    value: {
      n: string,
      z: string
    }
  },
  boolean
>;


export type TestAlgorithms = 'after' | 'before' | 'between' | 'diverge' | 'criteria';
export type TestHandlers = 'onThreshold' | 'onOverflow';
export type TestPosition = 'core' | 'previous' | 'next' | 'toObject' | 'toString' | 'toEquals' | 'valueOf' | 'update';
export type TestSchemas = 'isPosition' | 'isPositionObject';

export type TestName = TestAlgorithms | TestHandlers | TestPosition | TestSchemas;
export const isAlgorithmsTest = (value: string): value is TestAlgorithms => value === "after" || value === "before" || value === "between" || value === "diverge" || value === "criteria";
export const isHandlersTest = (value: string): value is TestHandlers => value === "onThreshold" || value === "onOverflow";
export const isPositionTest = (value: string): value is TestPosition => value === "core" || value === "previous" || value === "next" || value === "toObject" || value === "toString" || value === "toEquals" || value === "valueOf" || value === "update";
export const isSchemasTest = (value: string): value is TestSchemas => value === "isPosition" || value === "isPositionObject";

export type Test<T extends TestName> = T extends 'after' ? After : T extends 'before' ? Before : T extends 'between' ? Between : T extends 'diverge' ? Diverge : T extends 'criteria' ? Criteria : T extends 'onThreshold' ? OnThreshold : T extends 'onOverflow' ? OnOverflow : T extends 'core' ? Core : T extends 'previous' ? Previous : T extends 'next' ? Next : T extends 'toObject' ? ToObject : T extends 'toString' ? ToString : T extends 'toEquals' ? ToEquals : T extends 'valueOf' ? ValueOf : T extends 'update' ? Update : T extends 'isPosition' ? IsPosition : T extends 'isPositionObject' ? IsPositionObject : never;

type UnArray<T> = T extends Array<infer U> ? U : T;
export type Callback<T extends TestName> = (
  this: Mocha.Context,
  item: Omit<UnArray<Test<T>["items"]>, '_id' | 'message' | 'skip'>,
  done: (err?: Error) => void,
) => boolean | void;

export type Spies = { [T in TestName]: Test<T> };
