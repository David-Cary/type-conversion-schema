import { ToLiteralConvertor } from "../src/index"

describe("ToLiteralConvertor", () => {
  test("should force any value to the target value", () => {
    const convertor = new ToLiteralConvertor('-')
    const value = convertor.convert(42)
    expect(value).toBe('-')
  })
  test("should clone it's value to prevent modifications", () => {
    const convertor = new ToLiteralConvertor({ x: 1 })
    const value = convertor.convert(42)
    expect(value).toEqual({ x: 1})
    if(typeof value === 'object' && value != null) {
      value.x = 2
      expect(convertor.value.x).toBe(1)
    }
  })
})
