import {
  JSTypeToJSONSchema,
  JSTypeSchema
} from "../src/index"

describe("JSTypeToJSONSchema", () => {
  test("should copy schemas with only JSON elements exactly", () => {
    const source: JSTypeSchema = {
      anyOf: [
        {
          type: 'boolean'
        },
        {
          type: 'string'
        }
      ]
    }
    const results = JSTypeToJSONSchema(source)
    expect(results).toEqual(source)
    expect(results).not.toBe(source)
  })
  test("functions should be excluded", () => {
    const results = JSTypeToJSONSchema({
      anyOf: [
        {
          type: 'function'
        },
        {
          type: 'string'
        }
      ]
    })
    expect(results).toEqual({
      anyOf: [
        {
          type: 'string'
        }
      ]
    })
  })
  test("symbols should be excluded", () => {
    const results = JSTypeToJSONSchema({
      anyOf: [
        {
          type: 'symbol'
        },
        {
          type: 'string'
        }
      ]
    })
    expect(results).toEqual({
      anyOf: [
        {
          type: 'string'
        }
      ]
    })
  })
  test("'any' types should convert to true", () => {
    const results = JSTypeToJSONSchema({
      type: 'any'
    })
    expect(results).toEqual(true)
  })
})
