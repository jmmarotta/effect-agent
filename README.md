# Effect Agent

Effect Agent is a minimal, hackable toolkit for building durable agents with Effect TS.

It provides the core primitives for composing tools, workflows, and agents that can extend their own harnesses. The toolkit targets Node.js 24+, Bun, and Deno.

Omega will be a minimal coding harness maintained in a separate repository. It will consume Effect Agent's published library through its public API, providing a useful default coding experience that you can make your own.

We aim to stay closely aligned with [Effect](https://effect.website)'s API conventions, design patterns, and repository tooling, departing where the needs of this library justify it.

This project is heavily inspired by Pi, OpenCode, and the Vercel AI SDK.

## Development

The repository currently contains an empty core package and the library toolchain, not an agent API. Run `mise install` and `pnpm install`, then `pnpm check`. See [CONTRIBUTING.md](CONTRIBUTING.md) for build, runtime tests, package verification, and release setup.
