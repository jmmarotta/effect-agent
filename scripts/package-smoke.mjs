import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

// Copy into a fresh consumer install so imports resolve packed exports, not workspace source.
const manifest = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"))
for (const name of Object.keys(manifest.dependencies)) {
  if (name === "effect") continue
  assert.match(import.meta.resolve(name), /\/dist\/index\.js$/)
  await import(name)
  const packed = JSON.parse(await readFile(new URL(import.meta.resolve(`${name}/package.json`)), "utf8"))
  assert.equal(packed.exports["./internal/*"], null)
  // Runtimes use different error codes for unexported paths.
  await assert.rejects(import(`${name}/internal/forbidden`))
}
console.log(`Packed imports passed on ${process.versions.deno ? "Deno" : process.versions.bun ? "Bun" : "Node"}`)
