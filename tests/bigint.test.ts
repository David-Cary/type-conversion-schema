import { ToBigIntConvertor } from "../src/index"

const convertor = new ToBigIntConvertor()

test("x", ()=> {
  expect(true).toBe(true)
})

describe("ToBigIntConvertor", () => {
  describe("default value", () => {
    test("should use default value if target value does not resolve to a number", () => {
      const value = convertor.convertWith(
        undefined,
        {
          default: 0n
        }
      )
      expect(value).toEqual(0n)
    })
    test("should not use default value if target value does resolve to a number", () => {
      const value = convertor.convertWith(
        '1',
        {
          default: 0n
        }
      )
      expect(value).toBe(1n)
    })
  })
  describe("const value", () => {
    test("should override the provided value", () => {
      const value = convertor.convertWith(
        3,
        {
          const: 0n
        }
      )
      expect(value).toBe(0n)
    })
  })
  describe("max value", () => {
    test("should enforce maximum", () => {
      const value = convertor.convertWith(
        3,
        {
          maximum: 1n
        }
      )
      expect(value).toBe(1n)
    })
  })
  describe("min value", () => {
    test("should enforce minimum", () => {
      const value = convertor.convertWith(
        3,
        {
          minimum: 4n
        }
      )
      expect(value).toBe(4n)
    })
  })
  describe("positive action", () => {
    test("should flip negative numbers", () => {
      const value = convertor.convertWith(-1, { finalize: ['positive'] })
      expect(value).toBe(1n)
    })
  })
  describe("negative action", () => {
    test("should flip positive numbers", () => {
      const value = convertor.convertWith(1, { finalize: ['negative'] })
      expect(value).toBe(-1n)
    })
  })
  describe("multipleOf value", () => {
    test("should force to nearest multiple of target number", () => {
      const value = convertor.convertWith(
        3,
        {
          multipleOf: 5n
        }
      )
      expect(value).toBe(5n)
    })
  })
})
