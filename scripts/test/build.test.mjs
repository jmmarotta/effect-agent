import { transformSync } from "@babel/core"
import { describe, expect, it } from "vitest"

describe("published JavaScript", () => {
  it("annotates top-level calls without losing source maps", () => {
    const source = "export const value = makeValue()"
    const result = transformSync(source, {
      filename: "fixture.js",
      plugins: ["annotate-pure-calls"],
      sourceMaps: true,
      configFile: false,
      babelrc: false
    })
    expect(result.code).toContain("/*#__PURE__*/")
    expect(result.map.sourcesContent).toEqual([source])
  })
})
