# JavaScript Standard Funtional Library [JFL]

The JavaScript library that aims to compliment the language to provide a single dependency for writing most business logic code.

It is fully statically typed to work well with both Flow and TypeScript.

## What does "Functional" mean

The major difference between JFL and built-in JavaScript is that JFL favors a functional style over object-oriented style. This means that JFL:

- exposes functions
- the functions are pure - they don't mutate global state
- data is treated as immutable - functions don't mutate their arguments

Some libraries and languages that are functional include other mechanisms which JFL **does not** include for style reasons (explained below):

- [currying](https://en.wikipedia.org/wiki/Currying)
- [point-free style](https://en.wikipedia.org/wiki/Tacit_programming)
- passing functions as arguments by reference

## What's in it?

### Collections

The basic building block of a lot of code today are collections. JFL uses the same collections that JavaScript provides:

- Arrays
- Sets (ordered by insertion)
- Maps (ordered by insertion)

But unlike JavaScript, the operations that are provided treat these collections as immutable (or read-only) - which is enforced with the help of static typing.

### Other utilities

Utilities for the following are included:

- Dates & Times
- Math
- Regular Expressions
- Strings

## Naming

Because JFL provides utilities for existing types, it uses a naming convention to avoid masking built-in objects and functions:

- Array → Ar
- Collection → Cl
- Map → Mp
- RegExp → REx
- Set → St
- String → Str

## Example

```js
/// Get a set of elements from two arrays
// vanilla JS
new Set(a.concat(b))

// Lodash
_.uniq(_.concat(a, b)) // actually an Array

// JFL
import * as St from 'jfl/set'

St.union(a, b)
```

JFL is heavily inspired by the Hack Standard Library, and specifically for collections and more broadly follows this rule:

**The return type of a function determines which module the function is in.**

In the example above we know the result should be a `Set` and so we we can find the function in the `St` module.

More examples can be found in documentation.

## Principles

JFL is optimized primarily for code readability. It is not optimized for terseness, performance or space efficiency, although it strives to be as good as possible in those aspects without sacrificing readability.

As mentioned above, the library is organized in such a way that it should be easy to find the function you're looking for.

For argument order, collections always come first. This works well with Hack-style pipeline operator (available using Babel today, `#` is the preceding result placeholder):

```
list
  | Ar.map(#, x => x * x)
  | Ar.filter(#, x => x % 3 === 0)
  | Mth.sum(#)
```