import { execFileSync } from "node:child_process"
import { copyFile, mkdir, mkdtemp, readdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const runtime = process.argv[2] ?? "node"
if (!["node", "bun", "deno"].includes(runtime)) throw new Error("Expected runtime: node, bun, or deno")
// Pack with pnpm so publishConfig.exports is applied before either checker runs.
await mkdir(".tmp/packages", { recursive: true })
const destination = await mkdtemp(resolve(".tmp/packages/check-"))
let count = 0
for (const directory of await readdir("packages", { withFileTypes: true })) {
  if (!directory.isDirectory() || directory.name === "tools") continue
  const cwd = resolve("packages", directory.name)
  const manifest = JSON.parse(await readFile(resolve(cwd, "package.json"), "utf8"))
  if (manifest.private) continue
  execFileSync("pnpm", ["pack", "--pack-destination", destination], { cwd, stdio: "inherit" })
  count++
}
if (count === 0) throw new Error("No public packages found")
const dependencies = {}
for (const file of await readdir(destination)) {
  if (!file.endsWith(".tgz")) continue
  const tarball = resolve(destination, file)
  execFileSync("pnpm", ["exec", "publint", tarball], { stdio: "inherit" })
  execFileSync("pnpm", ["exec", "attw", tarball, "--profile", "esm-only"], { stdio: "inherit" })
  const packed = JSON.parse(execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" }))
  dependencies[packed.name] = `file:${tarball}`
}
const effect = JSON.parse(await readFile("node_modules/effect/package.json", "utf8"))
dependencies.effect = effect.version
const consumer = resolve(destination, "consumer")
await mkdir(consumer)
await writeFile(resolve(consumer, "package.json"), JSON.stringify({ private: true, type: "module", dependencies }))
await copyFile("scripts/package-smoke.mjs", resolve(consumer, "smoke.mjs"))
execFileSync("pnpm", ["install", "--ignore-workspace", "--ignore-scripts"], { cwd: consumer, stdio: "inherit" })
const args = runtime === "deno" ? ["run", "-A", "--node-modules-dir=manual", "smoke.mjs"] : ["smoke.mjs"]
execFileSync(runtime, args, { cwd: consumer, stdio: "inherit" })
