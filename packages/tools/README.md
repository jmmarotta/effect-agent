# Repository Tools

`oxc/src`, `oxc/test`, `oxc/oxlintrc.json`, and `jsdocs/src` and `jsdocs/test` were copied from Effect v4.0.7, commit `19d36b8948fc1ae6c570382d47fb5e70bafba25f`, at `https://github.com/Effect-TS/effect`. They are MIT licensed; the original license is in `LICENSE` here. Keep this attribution and update the commit when refreshing these copies.

Local adaptations: barrel-import patterns also reject the Effect Agent package root. Both tools are private workspaces. JSDoc extraction, docgen, and the no-unused-internal lint rule use package-local TypeScript 6 compiler API dependencies; repository builds use TypeScript 7. Copied tests run with the repository suite, with imports adjusted to local workspace names. The root lint config exempts copied code from five additional type-aware rules introduced by the tsgo preset; upstream's base lint configuration remains active. Formatting excludes these copies to make upstream refreshes easier.
