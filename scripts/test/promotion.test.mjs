import { describe, expect, it } from "vitest"
import { planPromotion } from "../npm-promote.mjs"

const member = (name, staging = "0.2.0", latest = "0.1.0") => ({
  name,
  staging,
  latest,
  version: staging
})

describe("release promotion", () => {
  it("plans the whole fixed group", () => {
    expect(planPromotion([member("core"), member("node")])).toEqual([
      { name: "core", version: "0.2.0" },
      { name: "node", version: "0.2.0" }
    ])
  })
  it("retries partial promotion without rewriting completed tags", () => {
    expect(planPromotion([member("core", "0.2.0", "0.2.0"), member("node")])).toEqual([
      { name: "node", version: "0.2.0" }
    ])
  })
  it("supports first publication without latest", () => {
    expect(planPromotion([{ ...member("core"), latest: undefined }])).toHaveLength(1)
  })
  it("rejects incomplete and inconsistent releases", () => {
    expect(() => planPromotion([])).toThrow()
    expect(() => planPromotion([member("core"), member("node", "0.1.0")])).toThrow()
    expect(() => planPromotion([{ ...member("core"), version: undefined }])).toThrow()
  })
  it("rejects downgrades and prereleases", () => {
    expect(() => planPromotion([member("core", "0.2.0", "0.3.0")])).toThrow()
    expect(() => planPromotion([member("core", "0.2.0-beta.1")])).toThrow()
  })
})
