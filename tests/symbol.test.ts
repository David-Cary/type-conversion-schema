import { ToSymbolConvertor } from "../src/index"

const convertor = new ToSymbolConvertor()

describe("ToSymbolConvertor", () => {
  describe("default action", () => {
    test("should generate a new symbol if none is provided", () => {
      const value = convertor.convertWith(
        'hi',
        {}
      )
      expect(value.toString()).toBe("Symbol(hi)")
    })
    test("should return the symbol if one is provided", () => {
      const source = Symbol('x')
      const value = convertor.convertWith(
        source,
        {}
      )
      expect(value).toBe(source)
    })
  })
  describe("forKey action", () => {
    test("should create a symbol for the provided key", () => {
      const value = convertor.convertWith(
        null,
        {
          convertVia: {
            type: 'forKey',
            key: 'q'
          }
        }
      )
      expect(Symbol.keyFor(value)).toBe('q')
    })
    test("should use the value if there's no explicit key", () => {
      const value = convertor.convertWith(
        'w',
        {
          convertVia: 'forKey'
        }
      )
      expect(Symbol.keyFor(value)).toBe('w')
    })
  })
})
