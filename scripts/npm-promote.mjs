import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"

function versionParts(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Expected stable release version, got ${version}`)
  return version.split(".").map(Number)
}

/** Verify the entire fixed group before returning any tag writes. No downgrades. */
export function planPromotion(packages) {
  if (packages.length === 0) throw new Error("Empty release group")
  const version = packages[0].staging
  versionParts(version)
  for (const pkg of packages) {
    if (pkg.staging !== version) throw new Error("Staged versions do not match; retry after publication completes")
    if (pkg.version !== version) throw new Error(`Registry metadata missing for ${pkg.name}@${version}`)
    if (pkg.latest !== undefined) {
      const current = versionParts(pkg.latest)
      const target = versionParts(version)
      const difference = target.findIndex((part, index) => part !== current[index])
      if (difference !== -1 && target[difference] < current[difference]) {
        throw new Error(`Refusing to downgrade ${pkg.name} from ${pkg.latest} to ${version}`)
      }
    }
  }
  return packages.filter((pkg) => pkg.latest !== version).map((pkg) => ({ name: pkg.name, version }))
}

function npmJson(args) {
  return JSON.parse(execFileSync("npm", [...args, "--json", "--prefer-online"], { encoding: "utf8" }))
}

async function main() {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== "--dry-run")) throw new Error("Usage: npm-promote.mjs [--dry-run]")
  const config = JSON.parse(await readFile(new URL("../.changeset/config.json", import.meta.url), "utf8"))
  if (config.fixed.length !== 1) throw new Error("Expected one explicit Changesets fixed group")
  const packages = config.fixed[0].map((name) => {
    const tags = npmJson(["view", name, "dist-tags"])
    versionParts(tags.staging)
    const metadata = npmJson(["view", `${name}@${tags.staging}`])
    if (metadata.name !== name) throw new Error(`Unexpected registry package for ${name}`)
    return { name, staging: tags.staging, latest: tags.latest, version: metadata.version, dist: metadata.dist }
  })
  const changes = planPromotion(packages)
  // Fetch and validate all tarballs before the first write, including already-promoted members.
  for (const pkg of packages) {
    const response = await fetch(pkg.dist.tarball)
    if (!response.ok) throw new Error(`Tarball unavailable: ${pkg.name} (${response.status})`)
    const bytes = Buffer.from(await response.arrayBuffer())
    const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`
    if (integrity !== pkg.dist.integrity) throw new Error(`Tarball integrity mismatch: ${pkg.name}`)
  }
  for (const change of changes) {
    console.log(`${args.includes("--dry-run") ? "Would promote" : "Promoting"} ${change.name}@${change.version}`)
    if (!args.includes("--dry-run")) {
      execFileSync("npm", ["dist-tag", "add", `${change.name}@${change.version}`, "latest"], { stdio: "inherit" })
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
