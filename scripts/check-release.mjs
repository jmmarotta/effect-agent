import { readFile } from "node:fs/promises"

const config = JSON.parse(await readFile(".changeset/config.json", "utf8"))
if (config.changelog[1].repo !== process.env.GITHUB_REPOSITORY) {
  throw new Error("Set the Changesets changelog repository before enabling releases")
}
for (const name of config.fixed.flat()) {
  const manifest = JSON.parse(await readFile(`packages/${name.split("/")[1]}/package.json`, "utf8"))
  if (!manifest.repository?.url) throw new Error(`Set repository metadata for ${name} before releasing`)
}
