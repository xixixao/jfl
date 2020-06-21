## Test

```sh
npm test
```

## Build

```sh
npm run build
```

## Format

```sh
npx prettier --write --parser flow src/* test/*
```

## Principles

**Q: Use JS built-in or JFL in the implementation?**
A: Use built-in if it's sufficient, to optimize perf. Otherwise use JFL.

**Q: What should be the order of words in a name of a function?**
A: For pattern `from`, `to`, `convert`, use `fromX`, `xConvert`, `toX`.
A: Otherwise place the meaningful/repeated word first, like `map`, `mapAsync`, `mapMaybe`, `mapFlat`.
