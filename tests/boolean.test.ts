import {
  ToBooleanConvertor,
  TypeConversionResolver,
  DEFAULT_TYPE_CONVERTORS
} from "../src/index"

const convertor = new ToBooleanConvertor()

describe("ToBooleanConvertor", () => {
  describe("default action", () => {
    test("should use default value if target value is undefined", () => {
      const value = convertor.convertWith(
        undefined,
        {
          default: true
        }
      )
      expect(value).toBe(true)
    })
  })
  describe("setTo action", () => {
    test("should override the provided value", () => {
      const value = convertor.convertWith(
        false,
        {
          const: true
        }
      )
      expect(value).toBe(true)
    })
  })
  describe("get action", () => {
    test("should extract the target value", () => {
      const value = convertor.convertWith(
        { value: 1 },
        {
          prepare: [
            {
              type: 'get',
              path: 'value'
            }
          ]
        }
      )
      expect(value).toBe(true)
    })
  })
  describe("negate action", () => {
    test("should negate the provided value", () => {
      const value = convertor.convertWith(
        false,
        {
          finalize: ['negate']
        }
      )
      expect(value).toBe(true)
    })
  })
  describe("parse action", () => {
    test("should treat 'false' text as false", () => {
      const value = convertor.convertWith(
        'false',
        {
          convertVia: 'parse'
        }
      )
      expect(value).toBe(false)
    })
    test("should apply the provided false value", () => {
      const value = convertor.convertWith(
        'no',
        {
          convertVia: {
            type: 'parse',
            false: 'no'
          }
        }
      )
      expect(value).toBe(false)
    })
  })
  describe("convert action", () => {
    test("should apply nested conversion", () => {
      const value = convertor.convertWith(
        '0',
        {
          prepare:[
            {
              type: 'convert',
              to: 'number'
            }
          ]
        },
        new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)
      )
      expect(value).toBe(false)
    })
  })
})
