import { describe, it } from "mocha";
import { resolve, throu, throuSync } from "xufs";

import {
  Callback,
  isAlgorithmsTest,
  isHandlersTest,
  isPositionTest,
  isSchemasTest,
  Test,
  TestName,
} from "./types";
import path from "path";

import createNumberSystem from "../src/system/system";

// Tests
import createAlgorithmTest from "./callee/algorithms";
import createPositionTest from "./callee/position";
import createHandlersTest from "./callee/handlers";
import createSchemasTest from "./callee/schemas";
import { expect } from "chai";

function capitalize(value: string) {
  const subs = value.substring(0, 1).toLocaleUpperCase();
  const computed = value
    .substring(1, value.length)
    .replace(/ \p{Ll}/gu, function (match, p1, offset, string) {
      return " " + match.toLocaleUpperCase();
    });

  return subs + computed;
}

const stack: ((this: Mocha.Suite) => void)[] = [];

let self: any = this;
function exec() {
  const system = createNumberSystem(require(`./mocks/system.json`));
  const isSystemFile = (pathname: string) => pathname.includes("system.json");

  throuSync(
    {
      watcher: (pathname) => {
        if (!isSystemFile(pathname)) {
          const key = path
            .basename(pathname)
            .replace(/.json/gi, "") as TestName;

          let callee: Callback<any>;
          if (isAlgorithmsTest(key)) {
            callee = createAlgorithmTest(key, system);
          } else if (isPositionTest(key)) {
            callee = createPositionTest(key, system);
          } else if (isHandlersTest(key)) {
            callee = createHandlersTest(key, system);
          } else if (isSchemasTest(key)) {
            callee = createSchemasTest(key, system);
          } else {
            throw new Error(`Test '${key}' has no implementation`);
          }

          let test = require(pathname) as Test<typeof key>;
          let description = capitalize(`${key} Testing`);

          stack.push(function () {
            describe(description, function () {
              const { items, skip } = test;

              this.beforeAll(function () {
                if (skip) this.skip();
              });

              for (const item of items) {
                it(item.message, function (done) {
                  if (item.skip) this.skip();
                  const open = callee.call(this, item, done);
                  if (!open) done();
                });
              }
            });
          });
        }
      },
      observe: "files",
    },
    resolve("tests", "mocks"),
  );
}

try {
  exec();
  for (const task of stack) {
    task.call(self);
  }
} catch (error) {
  console.error(error);
}

// exec();
