Staquia
================

This is a configurable __position__ based algorithm, used to get the core, next or previous number for a nth base number system.

This base should containt a set of odd numbers with no representation of negative values where:
- Exits an odd defined base *b* 
- Exits a final number *sf* 
- Exits a start number *s0* 
- Exits a zero number *z*
- Exits a  middle character *m* that is the value between *sf* and *s0* such that `m = ceil((sf + s0) / 2)`

Inside the class exits three variables that will represents the numbers mentioned above in the Unicode standard number value.
``` typescript
import { Staquia } from 'staquia';

// This example has an 27th base number set [a - z]
Staquia.update = {
    // z
    zero: "!",
    // sf
    first = "a",
    // s0
    last = "z"
}
```

>___Note:___ All of the following examples are shown using the above system in the example.

Position
----------------

Is an object that represents a `position` that can be used either on on a table or a stack.

This contains functions to get the __next__, __previous__ or even the __core__ position that lays between this and another position.

The system from this position is based on a string that contains two sections, the `n` part and the `z` part.

This uses the property of string comparison where depending on the [unicode](https://en.wikipedia.org/wiki/Unicode) number that represents the character, this may be *bigger* or *smaller* then other.

``` typescript
// Unicode \u0061 (61)
const a = "a";

// Unicode \u0062 (62)
const b = "b";

// Will print true as 61 < 62
console.log(a < b);

```

### Section `n`

This section was designed with the sole purpose the to move *up* or *down* one position when the `next` or `previous` algorithm is used.

``` typescript
import { Staquia } from 'staquia';

// This example uses the 27th base number set [a - z]
const xy = new StaquiaPosition("xy"); 
const xz = xy.next();
// Prints - The following character is !!xz"
console.log("The following character is " & xz)

// This example uses the 27th base number set [a - z] with character zero as !
const b0 = new StaquiaPosition("b!");
const az = Staquia.previous();
// Prints - The previous character is !!az"
console.log("The previous character is " & az)
```

### Section `z`

This section was designed with the sole purpose the to go to the *mid* value from two positions when the `core` algorithm is used.

``` typescript
import { Staquia } from 'staquia';

// This example uses the 27th base number set [a - z]
const a = new StaquiaPosition("a"); 
const b = new StaquiaPosition("b");

const am = a.core(b);

// Prints - The following character is !!!am"
console.log("The following character is " & am)

```
Above explains how the position systems works but there is more if you want to get the full power from this algorithm please visit [documentation site](https://nona9614.github.io/staquia-js/). 
