# Staquia

This is a configurable lexicographic **position** based algorithm, used to get the core, next or previous number for a nth base number system. This project was created with the intention to solve the reinsertion and sorting problem when using long lists.

To have a full detailed explanation you can go to the [documentation site](https://nona9614.github.io/staquia-js/).

You can install it like below.

```npm
  npm install staquia --save-dev
```

Or use it from the `unpkg` cdn as a simple script tag via the browser.

```html
  <script src="https://unpkg.com/staquia@'<version/>'/umd/index.js"><script/>
```

This exposes a global `staquia` function that works exactly the same way as the `ECMA` import version.

All of the examples in this document uses `ECMA` syntax to import or export code from the library, but this supports `CommonJS` syntax as well.

```js
// ECMA Syntax
import { staquia } from "staquia";

// CommonJS Syntax
const { staquia } = require("staquia");

// Some libraries will support conditional imports poorly
// or not even support it.
// For these cases you can force the imports like below.

// For ECMA Scripts
import { staquia } from "staquia/esm";
// For CommonJS Scripts
const { staquia } = require("staquia/cjs");
// For browser applications UMD
const { staquia } = require("staquia/umd");
```

## Settings

You can pass as settings the options to create the best system that fits your needs.

```typescript
import { staquia } from "staquia";

// This example has an 27th base number set [a - z]
staquia.setup({
  // z
  zero: "!",
  // sf
  first: "a",
  // s0
  last: "z",
  // kappa
  ϰ: 0.15,
  // `n` and `z`
  segments: {
    n: 5,
    z: 15,
  },
});
```

> **_Note:_** All of the following examples are shown using the above system in the example.

## Position

Is an object that represents a `position` that can be used either on on a table or a stack.

This contains functions to get the **next**, **previous** or even the **core** position that lays between this and another position.

The system from this position is based on a string that contains two sections, the `n` part and the `z` part.

This uses the property of string comparison where depending on the [unicode](https://en.wikipedia.org/wiki/Unicode) number that represents the character, this may be _bigger_ or _smaller_ than other.

```typescript
// Unicode \u0061 (61)
const a = "a";

// Unicode \u0062 (62)
const b = "b";

// Will print true as 61 < 62
console.log(a < b);
```

### Section `n`

This section was designed with the sole purpose the to move _up_ or _down_ one position when the `next` or `previous` algorithm is used.

```typescript
import { staquia } from "staquia";

// This example uses the 27th base number set [a - z]
const xy = staquia.position("xy");
const xz = xy.next();
// Prints - The following character is !!xz"
console.log("The following character is " & xz);

// This example uses the 27th base number set [a - z] with character zero as !
const b0 = staquia.position("b!");
const az = b0.previous();
// Prints - The previous character is !!az"
console.log("The previous character is " & az);
```

### Section `z`

This section was designed with the sole purpose the to go to the _mid_ value from two positions when the `core` algorithm is used.

```typescript
import { staquia } from "staquia";

// This example uses the 27th base number set [a - z]
const a = staquia.position("a");
const b = staquia.position("b");

const am = a.core(b);

// Prints - The following character is !!!am"
console.log("The following character is ", am);
```

Above explains how the position systems works but there is more if you want to get the full power from this algorithm as mention in the beggining please visit [documentation site](https://nona9614.github.io/staquia-js/).
