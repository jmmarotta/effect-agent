import { execFileSync } from "node:child_process"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const require = createRequire(import.meta.url)
const manifest = require.resolve("@effect/docgen/package.json")
const bin = new URL("./dist/bin.js", pathToFileURL(manifest))
execFileSync(process.execPath, [fileURLToPath(bin)], {
  cwd: new URL("../../../effect-agent/", import.meta.url),
  stdio: "inherit"
})
