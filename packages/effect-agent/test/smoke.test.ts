import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Agent from "@jmmarotta/effect-agent"

describe("workspace", () => {
  it.effect("loads core without runtime dependencies", () =>
    Effect.sync(() => {
      assert.deepStrictEqual(Object.keys(Agent), [])
      const runtime = process.env.EXPECTED_RUNTIME ?? "node"
      if (runtime === "bun") assert.isDefined(process.versions.bun)
      if (runtime === "deno") assert.isDefined(process.versions.deno)
      if (runtime === "node") {
        assert.isUndefined(process.versions.bun)
        assert.isUndefined(process.versions.deno)
      }
    })
  )
})
