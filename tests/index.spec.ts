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

// System
import url from "url";
import numberSystem from "./mocks/system.json" assert { type: "json" };

function capitalize(value: string) {
  const subs = value.substring(0, 1).toLocaleUpperCase();
  const computed = value
    .substring(1, value.length)
    .replace(/ \p{Ll}/gu, function (match, p1, offset, string) {
      return " " + match.toLocaleUpperCase();
    });

  return subs + computed;
}

const stack: { description: string; test: Test<any>; callee: Callback<any> }[] =
  [];

let self: any = this;
async function collect() {
  const system = createNumberSystem(numberSystem);
  const isSystemFile = (pathname: string) => pathname.includes("system.json");

  await throu(
    {
      watcher: async (pathname) => {
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

          const testPath = url.pathToFileURL(pathname).toString();
          let test = (await import(testPath, {
            assert: { type: "json" },
          })) as any;
          if (test.default) test = test.default;
          const description = capitalize(`${key} Testing`);

          stack.push({ test, description, callee });
        }
      },
      observe: "files",
    },
    resolve("tests", "mocks"),
  );
}

try {
  await collect();
  for (const { description, callee, test } of stack) {
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
  }
} catch (error) {
  console.error(error);
}
