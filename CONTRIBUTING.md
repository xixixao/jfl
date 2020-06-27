## Test, Build, Format

See package.json "scripts", run them via `npm run ___`

## Format

## Principles

**Q: Use JS built-in or JFL in the implementation?**
A: Use built-in if it's sufficient, to optimize perf. Otherwise use JFL.

**Q: What should be the order of words in a name of a function?**
A: For pattern `from`, `to`, `convert`, use `fromX`, `xConvert`, `toX`.
A: Otherwise place the meaningful/repeated word first, like `map`, `mapAsync`, `mapMaybe`, `mapFlat`.
