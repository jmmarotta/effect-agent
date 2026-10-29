# Development

Run `mise install`, then `pnpm install`. mise pins Node, pnpm, Bun, and Deno. Only Lefthook's dependency install script is allowed; the root prepare hook patches oxlint for Effect diagnostics. Run `pnpm setup:effect` separately if you need the local Effect reference checkout.

## Commands

- `pnpm check`: lint, format check, project-reference typecheck, JSDoc validation, and tests.
- `pnpm test`, `pnpm test:bun`, `pnpm test:deno`: the same Vitest suite on each runtime.
- `pnpm build`: TypeScript declarations, JavaScript, maps, then Babel pure-call annotations.
- `pnpm check:packages`: build and pack every public workspace package, then run publint and Are The Types Wrong (ESM-only profile) on the actual tarballs and install them in a separate consumer for runtime imports. Tarballs go in `.tmp/packages`.
- `pnpm docs:build`: generate core API documentation in `docs`.
- `pnpm format`: format repository files. Copied upstream tools retain their formatting.
- `pnpm changeset`: describe a public API change. Public packages use one Changesets fixed group.

Core has only an Effect peer dependency. Add runtime-specific implementations in separate packages when needed, not in core. Workspace exports resolve source; pnpm replaces them with `publishConfig.exports` when packing. Add explicit subpath exports for each new public module in both export maps. Internal modules must remain blocked. Published source and declaration maps support navigation back to source.

## Release Contract

CI checks Node 24 and 26, Bun, and Deno, plus packed-package metadata and runtime imports from installed tarballs. Consumer fixtures live under `.tmp`; their fresh installs verify published exports, but ancestor workspace `node_modules` remain reachable, so these are not hermetic undeclared-dependency checks. Preview builds use pkg-pr-new, not npm versions. Omega can use `link:` locally or a preview URL; preview consumers may need to allow URL subdependencies in pnpm (`blockExoticSubdeps: false`). Previews are temporary, not long-term dependencies.

Release workflows remain disabled until the repository variable `RELEASE_ENABLED` is `true`. No GitHub repository or remote is assumed by local commands. Before enabling releases:

1. Confirm public-package repository/homepage/bugs metadata and the Changesets changelog repository match `jmmarotta/effect-agent`. These are configured; update them if the repository moves.
2. Install the pkg-pr-new GitHub App and set `PREVIEWS_ENABLED=true` to enable previews.
3. Build and manually publish each initial public package under `staging` using `pnpm publish --tag staging --access public --no-provenance` from each package directory. Local publication cannot generate CI provenance, so the explicit override is required for this bootstrap publish. Subsequent trusted CI publishes enable provenance through the manifest. This is a deliberate external action, not part of installation or checks.
4. Configure npm trusted publishing for `release.yml` and dist-tag access for `npm-promote.yml` with the `npm-promote` environment. Configure that GitHub environment before enabling promotion. No npm token is stored in this repository.
5. Enable Actions pull-request creation. The Changesets action uses the GitHub token; release PR workflows may require approval or a suitably scoped bot token if automatic triggering is needed.
6. Set `RELEASE_ENABLED=true`. Review a Changesets release PR, then merge it to publish under `staging`.

Promotion reads the Changesets fixed group, requires every staged version to match, checks each version's registry metadata and downloadable tarball, and only then moves `latest`. It refuses downgrades and can safely retry partial tag updates. `pnpm promote --dry-run` performs the readiness checks without writing tags. `NPM_PROMOTE_PAUSED=true` pauses scheduled promotion. Registry propagation delays fail the current run; the schedule retries later. npm tag updates are not atomic across packages.

When adding a public package, add it to the build project references and Changesets fixed group, add its explicit workspace and published export maps, extend snapshot paths, and give its docs a separate output directory. The build and packed checks discover public packages under `packages/*`; runtime adapters do not exist until they contain implementations.

Breaking changes on `0.x` use a minor changeset. All development tool versions are exact; shared versions live in the pnpm catalog. Dependency updates are manual. New releases wait one day before installation.
