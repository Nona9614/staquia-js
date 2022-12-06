import { describe, it } from "mocha";
import { resolve, throu } from "xufs";

import {
  Callback,
  isAlgorithmTest,
  isPositionTest,
  Test,
  TestName,
} from "./types";
import path from "path";
import createAlgorithmTest from "./callee/algorithms";
import createNumberSystem from "../src/system/system";
import createPositionTest from "./callee/position";

function capitalize(value: string) {
  const subs = value.substring(0, 1).toLocaleUpperCase();
  const computed = value
    .substring(1, value.length)
    .replace(/ \p{Ll}/gu, function (match, p1, offset, string) {
      return " " + match.toLocaleUpperCase();
    });

  return subs + computed;
}

const stack: (() => void)[] = []

let self: any = this;
async function exec() {
  const system = createNumberSystem(await import(`./mocks/system.json`));
  const isSystemFile = (pathname: string) => pathname.includes("system.json");

  await throu({
    watcher: async (pathname) => {
      if (!isSystemFile(pathname)) {
        const key = path.basename(pathname).replace(/.json/gi, "") as TestName;
    
        let callee: Callback<any>;
        if (isAlgorithmTest(key)) {
          callee = createAlgorithmTest(key, system);
        } else if (isPositionTest(key)) {
          callee = createPositionTest(key, system);
        } else {
          throw new Error(`Test '${key}' has no implementation`);
        }
  
        let test = (await import(pathname)) as Test<typeof key>;
        let description = capitalize(`${key} Testing`);

        stack.push(function () {
          describe(description, function () {
            const { items, skip } = test;
    
            this.beforeAll(function () {
              if (skip) this.skip();
            });
    
            for (const item of items) {
              it(item.message, function () {
                if (item.skip) this.skip();
                callee.call(this, item);
              });
            }
          });
        })

      }
    },
    observe: 'files'
  }, resolve("tests", "mocks"));

  for (const task of stack) {
    task.call(self);
  }
}

describe('Automatic Tests', async function () {
  await exec();

})

// exec();
