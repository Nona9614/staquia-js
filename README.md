# Staquia

Staquia is a configurable, zero dependency, lexicographic **position** algorithm. It solves the reinsertion and sorting problem of long lists: every item stores a short `string` position, and sorting those strings gives the order of the list.

When an item is moved, only **its own** position changes, the surrounding items never need to be updated. This makes it ideal for lists and tables stored in a database, where reordering one row should mean writing one row.

To have a full detailed explanation you can go to the [documentation site](https://nona9614.github.io/staquia-js/).

- [Installation](#installation)
- [Quick start](#quick-start)
- [How positions work](#how-positions-work)
- [Creating a system](#creating-a-system)
- [Positions](#positions)
- [Results and errors](#results-and-errors)
- [Lexical list](#lexical-list)
- [Storing positions in a database](#storing-positions-in-a-database)
- [Running the tests](#running-the-tests)

## Installation

```bash
npm install staquia
```

The library is shipped only as an ES module.

```js
import Staquia, { LexicalList } from "staquia";
```

Or import it directly from a CDN in the browser:

```html
<script type="module">
  import Staquia, { LexicalList } from "https://cdn.jsdelivr.net/npm/staquia@{version}/+esm";
</script>
```

### CommonJS projects

Node `20.19` or newer can `require` ES modules, so CommonJS projects can still use the library. The default export is in the `default` field:

```js
const { default: Staquia, LexicalList } = require("staquia");
```

> **_Note:_** Jest does not transform the `node_modules` folder by default and its ES module support is still experimental. Add `transformIgnorePatterns: ["node_modules/(?!staquia)"]` to its configuration, or use a test runner with native ES module support like Vitest.

## Quick start

```js
import Staquia, { LexicalList } from "staquia";

// The number system that generates the positions (see "Creating a system")
const system = Staquia.create("!", "a", "z", 5, 15, 0.15);

// Any object with an `id` and a `position` field can be stored
const list = new LexicalList(system);
const tasks = [
  { id: 1, title: "Write", position: "" },
  { id: 2, title: "Review", position: "" },
  { id: 3, title: "Publish", position: "" },
];
for (const task of tasks) list.push(task);
// tasks positions: "mmmmm!", "mmmmn!", "mmmmo!"

// Moves the task 3 between the tasks 1 and 2
const moved = list.move(3, 1, 2);
if (moved.ok) {
  // Only the task 3 changed: "mmmmmn", save only this row
  console.log(moved.value.position.toString());
}
```

The `position` field of your objects is always kept in sync, so after any operation the object itself can be saved.

## How positions work

A position is a string with two sections:

```
 mmmmm  n
└──N──┘ └Z┘
```

- **`N`** has a **fixed size** (`ln` characters). It works like a short integer, so `next` and `previous` simply add or remove one, which is fast and keeps positions short.
- **`Z`** has a **flexible size** (up to `lz` characters). It works like the decimals of a number: when there is no room left between two positions, `core` calculates a new character and extends `Z`, giving the position a new life without touching its neighbors.

Repeated reinsertions in the same gap make `Z` longer. To avoid running out of room the system has two limits:

| Limit                 | When                                                                                 | Meaning                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| **Threshold reached** | The position length reaches `lϰ`, calculated from the factor `fϰ`                    | The positions in that area are getting long, it is time to space them again.                  |
| **Overflow**          | The position length is bigger than `ln + lz`, or `N` has no `next`/`previous` value  | There is no valid position, the positions must be spaced again before inserting.              |

Spacing the positions again is done sorting the list (see [`sort`](#sorting-and-rebalancing)).

## Creating a system

```js
import Staquia from "staquia";

const system = Staquia.create(
  "!", // zero: the character used as the zero digit
  "a", // first: the first character of the digits
  "z", // last: the last character of the digits
  5, // ln: the fixed length of the N section
  15, // lz: the maximum length of the Z section
  0.15, // fϰ: from 0 to 1, how close to the maximum length the threshold is reached
);

// Or use the default system: Staquia.create("!", "°", "ұ", 5, 15, 0.15)
const defaults = Staquia.default();
```

The digits are every character from `first` to `last` (in unicode order) plus the `zero`, so the example above is a 27th base number system. The characters must follow these rules:

- `zero` must be smaller than `first`, and `first` smaller than `last`, by their unicode value.
- Use characters from the [Basic Multilingual Plane](https://en.wikipedia.org/wiki/Plane_(Unicode)#Basic_Multilingual_Plane) (up to `U+FFFF`), so JavaScript, UTF-8 and UTF-16 compare them in the same order.

### Using several systems

An application can create as many systems as it needs, for example one with ASCII characters for keys used in URLs and the default one for a database, or the old and the new configuration while migrating the positions. Each system prints its positions with its own characters, creating a new system never affects the existing ones.

Positions can only be used by systems with the same configuration (the same `zero`, `first`, `last` and `ln`), as only then their digits have the same meaning. Passing a position from another system to `next`, `previous` or `core` fails with a `SystemMismatchError`:

```js
const alphabet = Staquia.create("!", "a", "z", 5, 15, 0.15);
const digits = Staquia.create("#", "0", "9", 5, 15, 0.15);

alphabet.next(digits.start()); // Fails with a SystemMismatchError

// Systems with the same configuration share their positions
const copy = Staquia.create("!", "a", "z", 5, 15, 0.15);
copy.next(alphabet.start()); // "mmmmn!"
```

### Custom classes

The classes used to create the positions and their numbers can be replaced passing them as options, for example to add your own methods to the positions:

```js
import Staquia, { Position } from "staquia";

class JsonPosition extends Position {
  // Serializes the position as its string instead of its internal digits
  toJSON() {
    return this.toString();
  }
}

const system = Staquia.create("!", "a", "z", 5, 15, 0.15, { position: JsonPosition });
const start = system.start().value;

start instanceof JsonPosition; // true
JSON.stringify({ id: 1, position: start }); // '{"id":1,"position":"mmmmm!"}'
```

| Option     | Default    | Requirements                                                                                     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `position` | `Position` | A class implementing `IPosition`, extending `Position` is the simplest way.                      |
| `number`   | `Digits`   | A class implementing `IDigits`, it stores the digits of the `N` and `Z` sections of a position.   |

The class passed is never modified: each system creates its own subclass of it, where the string representation of its positions is defined. Because of this the `constructor` of a position is that subclass (`instanceof` works as usual), and the same class can be passed to many systems.

### Migrating to a new configuration

To migrate the positions to a new configuration, read the rows sorted by their old position, clear their positions and load them in a list of the new system with the `untrusted` option. Every row is given a new position keeping the same order:

```js
// rows: SELECT * FROM tasks ORDER BY position
const list = new LexicalList(newSystem);
const result = list.set(
  rows.map((row) => ({ ...row, position: "" })),
  { untrusted: true },
);
// result.value[0] contains every row with its new position, save all of them
```

> **_Note:_** All of the following examples use the `system` from the beginning of this section.

## Positions

Every function that creates a position returns a [`Result`](#results-and-errors).

```js
const start = system.start(); // "mmmmm!" the middle of N, with room on both sides
const next = system.next(start); // "mmmmn!"
const previous = system.previous(start); // "mmmml!"
const core = system.core(start, next); // "mmmmmn" a position between both

// Creates a position from its string, N is padded with zeroes to the right
const xy = system.forge("xy"); // "xy!!!!"

// Every character must be a digit of the system (the zero or from first to last)
const invalid = system.forge("abC"); // Fails with an InvalidCharacterError at the index 2
```

The functions `next`, `previous` and `core` accept either a position or a result, so calls can be chained without unwrapping them. Once a result fails, the error is passed along and no new positions are created.

```js
const result = system.next(system.next(system.start()));
if (result.ok) console.log(result.value.toString()); // "mmmmo!"
```

Positions are compared with explicit functions, which always agree with the order of their strings:

```js
const a = system.forge("mmmmm!m").value;
const b = system.forge("mmmmn").value;

a.compare(b); // "less" (also "equal" or "greater")
a.less(b); // also: lessOrEqual, greater, greaterOrEqual, equal
a.toString(); // "mmmmm!m"
```

## Results and errors

The library does not throw, every operation that may fail returns a `Result`:

```js
const result = system.next(system.forge("zzzzz"));
if (result.ok) {
  result.value; // The position
} else {
  result.error; // The error
}
```

| Error                   | Returned by                         | Meaning                                                                                  |
| ----------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `ThresholdReachedError` | Position functions                  | The position is valid but long, `error.position` contains it. Space the positions again. |
| `OverflowError`         | Position functions                  | There is no valid position, `error.position` contains the position that failed.         |
| `SystemMismatchError`   | `next`, `previous` and `core`       | The position was created by a system with a different configuration.                    |
| `InvalidCharacterError` | `forge`                             | The string contains a character that is not a digit, `error.index` tells which one.      |
| `LexicalError`          | `LexicalList` and `LexicalItem`     | An operation over the list failed, `error.type` tells the reason (see below).            |

```js
import { OverflowError } from "staquia";

const result = system.next(system.forge("zzzzz"));
if (!result.ok && result.error instanceof OverflowError) {
  // N is already the last value, the positions must be spaced again
}
```

There are no event handlers for the overflow or the threshold: every failure is returned and checked synchronously, in the same place it happens. To check a position you already have, the system also exposes the same conditions:

```js
system.isThresholdReached(position); // Its length reached the threshold lϰ
system.hasOverflow(position); // Its length is bigger than ln + lz
```

## Lexical list

`LexicalList` is a doubly linked list that keeps the order of your objects and their positions in sync. Each object must have an `id` (never `null` or `undefined`) and a `position` string.

```ts
import Staquia, { LexicalList } from "staquia";

interface Task {
  id: number;
  title: string;
  position: string;
}

const list = new LexicalList<number, Task>(system);
```

### Adding, moving and deleting

```js
list.push(task); // Adds the item at the end
list.unshift(task); // Adds the item at the start
list.move(id, previousId, nextId); // Moves the item between two adjacent items
list.move(id, undefined, firstId); // Moves the item to the start
list.move(id, lastId, undefined); // Moves the item to the end
list.delete(id); // Removes the item
```

- `push`, `unshift` and `move` return the affected item, which is the **only** one that needs to be saved.
- `move` verifies that `previousId` and `nextId` are adjacent (ignoring the moved item), moving an item to its current place does nothing.
- If a position can't be generated (threshold or overflow), the operation fails with a `"position"` error and the list is not changed.

### Reading

```js
list.size; // Number of items
list.first(); // First item
list.last(); // Last item
list.find(id); // Item by id
list.at(index); // Result with the item at the index
list.toArray(); // Result with all the items in order
list.head(); // Result with the position before the first item
list.tail(); // Result with the position after the last item
list.select(id); // Marks an item as selected
list.selected(); // The selected item (cleared when it is deleted)
```

Each item exposes its `id`, its `position`, and the ids of its `previous` and `next` items.

### Loading items

`set` replaces the content of the list, it is meant to load the items from a database. It returns the items whose position changed (only these need to be saved) and the list itself.

```js
// Trusted (default): the rows are already sorted by position
const result = list.set(rows);
if (result.ok) {
  const [affected, list] = result.value; // affected is always empty
}
```

By default the rows are **trusted**: they are linked in the same order they come and no position is changed. The order is still verified (one comparison per item), so if the rows are not sorted it fails with a `"not-ordered"` error instead of building a broken list. An empty or invalid position (e.g. with characters that are not digits of the system, or too long) fails with a `"position"` error.

When the data can't be trusted use the `untrusted` option, the rows are sorted by position and the invalid ones repaired:

```js
const rows = [
  { id: 1, position: "ccccc" },
  { id: 2, position: "aaaaa" },
  { id: 3, position: "aaaaa" }, // Repeated position
  { id: 4, position: "" }, // Missing position
];

const result = list.set(rows, { untrusted: true });
if (result.ok) {
  const [affected] = result.value;
  // Order: 2, 3, 1, 4
  // Affected: 3 ("bbbbb!") and 4 ("ccccd!"), save only these rows
}
```

- Sorting never changes a valid position, it only changes the order of the items.
- Repeated positions keep the first one, the others are given new positions right after it.
- Empty or invalid positions (e.g. with characters of another system) are given new positions at the end, in the incoming order.
- If there is no room to repair them, every position is spaced again from the start.

In both modes `null`, `undefined` or repeated ids fail with an error, and when any error is returned neither the list nor your objects are changed.

### Sorting and rebalancing

`sort` orders the items with a compare function and spaces every position again from the start. It returns the affected items (the ones whose position changed) and the sorted items.

```js
// Sorts by any criteria of the items (id, position, previous or next)
list.sort((a, b) => a.id - b.id);

// Rebalances keeping the current order, useful after a threshold or overflow error
const result = list.sort((a, b) => (a.position.less(b.position) ? -1 : 1));
if (result.ok) {
  const [affected] = result.value; // Save these rows
}
```

### List errors

Every `LexicalError` contains a `type` field:

| Type             | Reason                                                                               |
| ---------------- | ------------------------------------------------------------------------------------ |
| `"not-found"`    | The item, or a neighbor passed to `move`, does not exist in the list.                |
| `"not-adjacent"` | The neighbors passed to `move` are not adjacent, or the item is its own neighbor.    |
| `"position"`     | A position could not be generated (threshold or overflow), or is empty or invalid.   |
| `"invalid-id"`   | An item with a `null` or `undefined` id.                                             |
| `"duplicate-id"` | An item with an id that already exists in the list.                                  |
| `"not-ordered"`  | `set` received rows that are not sorted by position, use the `untrusted` option.     |
| `"map-overflow"` | The list structure is corrupted.                                                     |

## Storing positions in a database

Store the position in a text column and always read the rows with `ORDER BY position`. The database **must compare the positions byte by byte** (a binary collation), otherwise its order will not match the library order: many collations ignore symbols like the `!` zero, or ignore the letter case.

| Database   | Binary collation                                                                     |
| ---------- | ------------------------------------------------------------------------------------ |
| PostgreSQL | `COLLATE "POSIX"` or `COLLATE "C"` (both are the same byte order)                    |
| MySQL      | `utf8mb4_bin`                                                                        |
| SQL Server | `Latin1_General_100_BIN2_UTF8` (or any `_BIN2` collation)                            |
| SQLite     | `BINARY` (the default)                                                               |
| MongoDB    | The default string comparison, without a `collation` option                         |

```sql
-- PostgreSQL
CREATE TABLE tasks (
  id       serial PRIMARY KEY,
  title    text NOT NULL,
  position text COLLATE "POSIX" NOT NULL
);

CREATE INDEX tasks_position ON tasks (position);

SELECT * FROM tasks ORDER BY position;
```

If the collation is not binary, loading the rows with `set` will fail with a `"not-ordered"` error. Using the `untrusted` option in that case will hide the problem and rewrite positions on every load, so fix the collation instead.

## Running the tests

The project is developed with **pnpm only** (for its supply-chain checks, and because it doesn't run the install scripts of dependencies unless they are allowed in `pnpm-workspace.yaml`). Install the dependencies from the lockfile:

```bash
pnpm install --frozen-lockfile
```

The project uses its own test framework with a web report. Set the `PORT` (and optionally `VERBOSE=true`) in a `.env` file and run:

```bash
pnpm run tests
```

Then open `http://localhost:<PORT>` to see the report, where the tests are grouped by spec and by group.
