import {
  ToNumberConvertor,
  NumberSchema,
  TypeConversionSchema
} from "../src/index"

const convertor = new ToNumberConvertor()

test("x", ()=> {
  expect(true).toBe(true)
})

describe("ToNumberConvertor", () => {
  describe("default value", () => {
    test("should use default value if target value does not resolve to a number", () => {
      const value = convertor.convertWith(
        undefined,
        {
          default: 0
        }
      )
      expect(value).toBe(0)
    })
    test("should not use default value if target value does resolve to a number", () => {
      const value = convertor.convertWith(
        '1',
        {
          default: 0
        }
      )
      expect(value).toBe(1)
    })
  })
  describe("const value", () => {
    test("should override the provided value", () => {
      const value = convertor.convertWith(
        3,
        {
          const: 0
        }
      )
      expect(value).toBe(0)
    })
  })
  describe("maximum value", () => {
    test("should enforce maximum", () => {
      const value = convertor.convertWith(
        3,
        {
          maximum: 1
        }
      )
      expect(value).toBe(1)
    })
  })
  describe("minimum value", () => {
    test("should enforce minimum", () => {
      const value = convertor.convertWith(
        3,
        {
          minimum: 4
        }
      )
      expect(value).toBe(4)
    })
  })
  describe("round action", () => {
    test("should round to nearest integer", () => {
      const value = convertor.convertWith(0.5, { finalize: ['round'] })
      expect(value).toBe(1)
    })
    test("should set the number to an integer", () => {
      const schema: Partial<TypeConversionSchema> = {
        type: 'number',
        finalize: ['round']
      }
      convertor.expandSchema(schema)
      expect('integer' in schema).toBe(true)
      if('integer' in schema) {
        expect(schema.integer).toBe(true)
      }
    })
  })
  describe("roundUp action", () => {
    test("should round up to next highest integer", () => {
      const value = convertor.convertWith(0.1, { finalize: ['roundUp'] })
      expect(value).toBe(1)
    })
  })
  describe("roundDown action", () => {
    test("should round down to next lowest integer", () => {
      const value = convertor.convertWith(0.5, { finalize: ['roundDown'] })
      expect(value).toBe(0)
    })
  })
  describe("positive action", () => {
    test("should flip negative numbers", () => {
      const value = convertor.convertWith(-1, { finalize: ['positive'] })
      expect(value).toBe(1)
    })
    test("should set the minimum to 0", () => {
      const schema: Partial<TypeConversionSchema> = {
        type: 'number',
        finalize: ['positive']
      }
      convertor.expandSchema(schema)
      expect('minimum' in schema).toBe(true)
      if('minimum' in schema) {
        expect(schema.minimum).toBe(0)
      }
    })
  })
  describe("negative action", () => {
    test("should flip positive numbers", () => {
      const value = convertor.convertWith(1, { finalize: ['negative'] })
      expect(value).toBe(-1)
    })
    test("should set the minimum to 0", () => {
      const schema: Partial<TypeConversionSchema> = {
        type: 'number',
        finalize: ['negative']
      }
      convertor.expandSchema(schema)
      expect('maximum' in schema).toBe(true)
      if('maximum' in schema) {
        expect(schema.maximum).toBe(0)
      }
    })
  })
  describe("multipleOf value", () => {
    test("should force to nearest multiple of target number", () => {
      const value = convertor.convertWith(
        3,
        {
          multipleOf: 5
        }
      )
      expect(value).toBe(5)
    })
  })
})
