# Staquia Changelog

Select a Staquia version below to view the changelog history:

- [Staquia 0.5.0](#V0.5.0) **Current**
- [Staquia 0.4.0](#V0.4.0) **Unstable, do not use**
- [Staquia 0.3.4](#V0.3.4)

## V0.5.0

> **_Warning:_** The `0.4.0` version published on npm was an unverified, unstable build and must **never** be used in production. Upgrade from `0.3.x` or `0.4.0` directly to `0.5.0`, everything below describes the changes from `0.3.4`.

- **Very important:** Now the library creates instances of objects that will never live inside this library avoiding any kind of possible dangling reference helping the garbage collector.
  Because of this many functions were affected as the `Position` object is now a simple data object that does not contain any logic but compare itself with other positions.

### Positions

- Now there is an explicit function to create the positions from strings called `forge`.
- Each system creates its own subclass of the position class (`Position` or the custom one passed in the options) holding the `string` representation of its positions. The positions still contain only data and keep no reference to the system.
- The `Position` instance needs the instance of the generated system from `Staquia` to get the `next`, `previous` or `core` values.
- A `Result` object (`Ok` or `Err`) is returned each time a position is created to control failures synchronously, the library does not throw.
- Once an instance of any kind is created in this library is up to the user when to stop using it or control when is out of scope.
- As a `Result` object is returned, the `next`, `previous` and `core` functions accept it as input to not clutter the user code unwrapping it many times. Once a result failed, the error will be dragged to each call and will not generate new `Position` instances.
- The main default export is the `Staquia` class and contains a `default` function that creates a staquia object with the default values.
- Increased the default `N` length from `4` to `5` and the default `Z` length from `12` to `15`.
- Now the positions instead of using the `valueOf` function contain better functions to compare like: `equal`, `less`, `lessOrEqual`, `greater`, `greaterOrEqual` and `compare`. This way making comparisons explicit.
- The `onThresholdReached` and `onOverflow` event handlers were removed in favor of synchronous checks: the failed `Result` contains a `ThresholdReachedError` or an `OverflowError`. The `IStaquiaOptions` no longer accepts them, and the `IOverflowHandler`, `OverflowHandler` and `ThresholdReachedHandler` types were removed.
- The `hasOverflow` and `isThresholdReached` functions of `Staquia` check a position synchronously with the same conditions as the errors.
- **Fix:** `hasOverflow` considered a position with exactly the max length (`ln + lz`) an overflow, while creating it only returned a `ThresholdReachedError`. Now an overflow is only a position bigger than the max length, as in the `OverflowError`.
- `next` and `previous` now fail with an `OverflowError` when `N` is already its last or first value. Before, the position wrapped around silently (e.g. the next of `zzzz` was `a!!!`), breaking the order.
- **Fix:** `next` and `previous` now keep the leading zeroes of `N` (e.g. the next of `!!!a` is `!!!b` instead of `b!!!`).
- **Fix:** `forge` with strings 2 or more characters shorter than `N` lost characters (e.g. `xy` was forged as `!x!!`), now `N` is padded with zeroes to the right (`xy!!`).
- **Fix:** Comparing positions with different `Z` lengths now matches their string order. Before, a longer `Z` was considered bigger (e.g. `mmmm!m` was greater than `mmmma`).
- **Fix:** `core` returned the wrong result when its `next` argument was a failed result, now the error is returned.
- **Fix:** Creating a system overwrote the shared `Position.prototype.toString`, so the last created system changed how the positions of every other system were printed (e.g. after `Staquia.default()` the position `mmmmm!` of an alphabet system was printed and saved as `¼¼¼¼¼!`). Now every system has its own class and the `Position` class (or the custom one) is never modified.
- Added the `SystemMismatchError`, returned by `next`, `previous` and `core` when a position was created by a system with a different configuration (`zero`, `first`, `last` or `ln`). Positions can be shared between systems with the same configuration.
- Added the `InvalidCharacterError`, returned by `forge` when the string contains a character that is not a digit of the system (the zero or a character from `first` to `last`). Before, any character was accepted and generated digits out of the system base (e.g. `¼` in an `a`-`z` system), producing invalid positions. Because of this, `LexicalList.set` rejects these positions, or repairs them with the `untrusted` option.
- The `IPositionError` type now includes the `SystemMismatchError` and the `InvalidCharacterError`. The `position` field is only present in the errors with a position, the `InvalidCharacterError` has the forged `string` and the `index` of the invalid character instead.
- The `constructor` of a position is now its system class, a subclass of `Position` (or of the custom class). `instanceof Position` keeps working.
- **Breaking:** The `IPositionResponse` type was renamed to `IPositionResult`, an alias of `Result<IPosition, IPositionError>`.

### Lexical list

- Added the `LexicalList` class, a doubly linked list that keeps the order of objects with an `id` and a `position` field and their positions in sync. Only the moved or added item changes its position.
- Added the `LexicalItem` class that wraps each object of the list.
- `push` and `unshift` add items at the end or at the start of the list, `head` and `tail` return the positions before the first item and after the last one.
- `move` verifies in constant time that the neighbors are adjacent, fails if a passed neighbor does not exist, and does nothing when the item is already in the requested place.
- `delete` and `move` support any kind of id, including falsy ones like `0` or `""`. Items with a `null`, `undefined` or repeated id are rejected.
- The selection is cleared when the selected item is deleted, or when the list is cleared or replaced.
- `set` returns a `Result` with the affected items (the ones whose position changed, so only these need to be saved) and the list. By default the items are trusted to be sorted by position and the order is verified. With the `untrusted` option the items are sorted and repeated, empty or invalid positions are repaired. Nothing is changed when it fails.
- `sort` returns the affected items and the sorted items, it can be used to space the positions again after a threshold or overflow error.
- Added the `LexicalError` class with a `type` field: `not-found`, `not-adjacent`, `position`, `invalid-id`, `duplicate-id`, `not-ordered` and `map-overflow`.

### Exports

- **Breaking:** The library is shipped only as an ES module. The `CommonJS` and `UMD` builds and the `staquia/esm`, `staquia/cjs` and `staquia/umd` subpaths were removed, import the library from `staquia`.
  - CommonJS projects can still `require("staquia")` with Node `20.19` or newer (the default export is in the `default` field).
  - Browsers can import it from a CDN with `<script type="module">` (e.g. `https://cdn.jsdelivr.net/npm/staquia/+esm`).
  - Shipping a single format avoids loading two copies of the library, where `instanceof` checks of the errors would fail.
- The package requires Node `20.19` or newer.
- The `LexicalList`, `LexicalItem`, `LexicalError`, `OverflowError`, `ThresholdReachedError`, `SystemMismatchError`, `InvalidCharacterError`, `Ok` and `Err` classes and the `Result`, `Item`, `IPositionError` and `LexicalErrorType` types are now exported.

### Project

- A _Test Framework_ was built for this project removing the need to use `Mocha`.
- All dependencies from the library were removed and many others for development to make the library portable.
- Migrating all code to implement `interfaces` that can be shown in the documentation for more readability on how to use the project.
- The README was rewritten, including how to store the positions in a database with a binary collation (e.g. `COLLATE "POSIX"` in PostgreSQL).

## V0.4.0

- **Unstable:** an unverified build published by mistake. It must not be used in production, its changes are released and verified in [0.5.0](#V0.5.0).

## V0.3.4

- Naming `umd` to `staquia` removing special characters like `-` to be able to use the library with no need to use the global `this` as prefix.
- Fixing special imports to be able to import like `umd`, `esm` and `cjs`. Now any of the imports works with typescript.
- Mentionning in the readme the `guardex` dependency.
