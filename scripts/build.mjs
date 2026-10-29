import { execFileSync } from "node:child_process"
import { readdir, readFile, rm } from "node:fs/promises"
import { resolve } from "node:path"

const packages = []
for (const entry of await readdir("packages", { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === "tools") continue
  const directory = resolve("packages", entry.name)
  const manifest = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"))
  if (manifest.private) continue
  packages.push(directory)
}
// Incremental compilation does not remove outputs for deleted source modules.
// Clean compiler-owned artifacts, then force emission even if references are cached.
for (const directory of packages) {
  await rm(resolve(directory, "dist"), { recursive: true, force: true })
}
execFileSync("pnpm", ["exec", "tsc", "-b", "tsconfig.packages.json", "--force"], { stdio: "inherit" })
for (const directory of packages) {
  execFileSync(
    "pnpm",
    ["exec", "babel", "dist", "--plugins", "annotate-pure-calls", "--out-dir", "dist", "--source-maps"],
    {
      cwd: directory,
      stdio: "inherit"
    }
  )
}
