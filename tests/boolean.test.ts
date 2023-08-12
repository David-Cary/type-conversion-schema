import { ToBooleanConvertor } from "../src/index"

const convertor = new ToBooleanConvertor()

describe("ToBooleanConvertor", () => {
  describe("default action", () => {
    test("should use default value if target value is undefined", () => {
      const value = convertor.convertWith(
        undefined,
        [
          {
            type: 'default',
            value: true
          }
        ]
      )
      expect(value).toBe(true)
    })
  })
  describe("setTo action", () => {
    test("should override the provided value", () => {
      const value = convertor.convertWith(
        false,
        [
          {
            type: 'setTo',
            value: true
          }
        ]
      )
      expect(value).toBe(true)
    })
  })
  describe("negate action", () => {
    test("should negate the provided value", () => {
      const value = convertor.convertWith(false, ['negate'])
      expect(value).toBe(true)
    })
  })
})
