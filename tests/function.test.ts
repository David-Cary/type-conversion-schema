import {
  ToFunctionConvertor,
  TypeConversionResolver,
  DEFAULT_TYPE_CONVERTORS
} from "../src/index"

const convertor = new ToFunctionConvertor()
const resolver = new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)

describe("ToFunctionConvertor", () => {
  describe("default action", () => {
    test("should create a simple value wrapper by default", () => {
      const value = convertor.convertWith(
        'hi',
        {}
      )
      expect(value()).toBe("hi")
    })
    test("should return the function if one is provided", () => {
      const source = (n: number) => n + 1
      const value = convertor.convertWith(
        source,
        {}
      )
      expect(value).toBe(source)
    })
  })
  describe("wrap action", () => {
    test("should allow for a custom wrapper function", () => {
      const value = convertor.convertWith(
        0,
        {
          convertVia: {
            type: 'wrap',
            returns: {
              type: 'string'
            }
          }
        },
        resolver
      )
      expect(value()).toBe('0')
    })
  })
})
