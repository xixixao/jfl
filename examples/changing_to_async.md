# Changing code to async

Say you are writing some code, and you start of with a sync operation:

```js
async function getNavigation() {
  const indexSource = await readFile('source.txt', 'utf8');
  return indexSource
    .split('\n')
    .map(line => `<div>${getNavigationItem(line)}</div>`);
}
```

What happens if `getNavigationItem` needs to become async too?

```js
async function getNavigation() {
  const indexSource = await readFile('source.txt', 'utf8');
  return indexSource
    .split('\n')
    // This is illegal because the closure is not async
    .map((line) => `<div>${await getNavigationItem(line)}</div>`);
}
```

There's no way around it: We will have to restructure this code significantly for it to work.

Now let's look at the same code, but written with idiomatic JFL:

```js
async function getNavigation() {
  const indexSource = await readFile('source.txt', 'utf8');
  return Str.lines(indexSource)
    |> Ar.map(#, (line) => `<div>${getNavigationItem(line)}</div>`);
}
```

This is very similar. But what if `getNavigationItem` needs to become async like before?

```js
async function getNavigation() {
  const indexSource = await readFile('source.txt', 'utf8');
  return Str.lines(indexSource)
    |> Ar.mapAsync(
      #,
      async (line) => `<div>${await getNavigationItem(line)}</div>`,
    );
}
```

We added `Async` to `map` function, turned the closure into an async closure and boom: we did not have to change the structure of our code at all!
