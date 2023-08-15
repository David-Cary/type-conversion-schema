import {
  ToNumberConvertor,
  RoundNumberAction,
  NumberToMultipleOfAction,
  MinimumNumberAction,
  MaximumNumberAction,
  PositiveNumberAction,
  NegativeNumberAction,
  NumberSchema
} from "../src/index"

const convertor = new ToNumberConvertor()

test("x", ()=> {
  expect(true).toBe(true)
})

describe("ToNumberConvertor", () => {
  describe("default action", () => {
    test("should use default value if target value does not resolve to a number", () => {
      const value = convertor.convertWith(
        undefined,
        {
          finalize: [
            {
              type: 'default',
              value: 0
            }
          ]
        }
      )
      expect(value).toBe(0)
    })
    test("should not use default value if target value does resolve to a number", () => {
      const value = convertor.convertWith(
        '1',
        {
          finalize: [
            {
              type: 'default',
              value: 0
            }
          ]
        }
      )
      expect(value).toBe(1)
    })
  })
  describe("setTo action", () => {
    test("should override the provided value", () => {
      const value = convertor.convertWith(
        3,
        {
          prepare: [
            {
              type: 'setTo',
              value: 0
            }
          ]
        }
      )
      expect(value).toBe(0)
    })
  })
  describe("max action", () => {
    test("should enforce maximum", () => {
      const value = convertor.convertWith(
        3,
        {
          finalize: [
            {
              type: 'max',
              value: 1
            }
          ]
        }
      )
      expect(value).toBe(1)
    })
  })
  describe("min action", () => {
    test("should enforce minimum", () => {
      const value = convertor.convertWith(
        3,
        {
          finalize: [
            {
              type: 'min',
              value: 4
            }
          ]
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
  })
  describe("negative action", () => {
    test("should flip positive numbers", () => {
      const value = convertor.convertWith(1, { finalize: ['negative'] })
      expect(value).toBe(-1)
    })
  })
  describe("multiple action", () => {
    test("should force to nearest multiple of target number", () => {
      const value = convertor.convertWith(
        3,
        {
          finalize: [
            {
              type: 'multiple',
              value: 5
            }
          ]
        }
      )
      expect(value).toBe(5)
    })
    test("if provided an offset, should use that for rounding", () => {
      const value = convertor.convertWith(
        8,
        {
          finalize: [
            {
              type: 'multiple',
              value: 5,
              offset: 0
            }
          ]
        }
      )
      expect(value).toBe(5)
    })
  })
})

describe("RoundNumberAction", () => {
  const action = new RoundNumberAction()
  describe("modifySchema", () => {
    test("should set as an integer", () => {
      const schema: NumberSchema = { type: 'number' }
      action.modifySchema(schema)
      expect(schema.integer).toBe(true)
    })
  })
})

describe("NumberToMultipleOfAction", () => {
  const action = new NumberToMultipleOfAction()
  describe("modifySchema", () => {
    test("should set to integer if multiple of integer", () => {
      const schema: NumberSchema = { type: 'number' }
      action.modifySchema(schema, { value: 5 })
      expect(schema.integer).toBe(true)
    })
    test("should set to not an integer if multiple of non-integer", () => {
      const schema: NumberSchema = { type: 'number' }
      action.modifySchema(schema, { value: 0.5 })
      expect(schema.integer).toBe(false)
    })
  })
})

describe("MinimumNumberAction", () => {
  const action = new MinimumNumberAction()
  describe("modifySchema", () => {
    test("should set minimum value", () => {
      const schema: NumberSchema = { type: 'number' }
      action.modifySchema(schema, { value: 5 })
      expect(schema.minimum).toBe(5)
    })
    test("should set fall back to using a number if minimum is non-integer", () => {
      const schema: NumberSchema = { type: 'number', integer: true }
      action.modifySchema(schema, { value: 0.5 })
      expect(schema.integer).toBe(false)
    })
  })
})

describe("MaximumNumberAction", () => {
  const action = new MaximumNumberAction()
  describe("modifySchema", () => {
    test("should set maximum value", () => {
      const schema: NumberSchema = { type: 'number' }
      action.modifySchema(schema, { value: 5 })
      expect(schema.maximum).toBe(5)
    })
    test("should set fall back to using a number if minimum is non-integer", () => {
      const schema: NumberSchema = { type: 'number', integer: true }
      action.modifySchema(schema, { value: 0.5 })
      expect(schema.integer).toBe(false)
    })
  })
})

describe("PositiveNumberAction", () => {
  const action = new PositiveNumberAction()
  describe("modifySchema", () => {
    test("should force minimum to 0 if negative", () => {
      const schema: NumberSchema = { type: 'number', minimum: -1 }
      action.modifySchema(schema)
      expect(schema.minimum).toBe(0)
    })
    test("should force minimum to 0 if undefined", () => {
      const schema: NumberSchema = { type: 'number' }
      action.modifySchema(schema)
      expect(schema.minimum).toBe(0)
    })
  })
})

describe("NegativeNumberAction", () => {
  const action = new NegativeNumberAction()
  describe("modifySchema", () => {
    test("should force maximum to 0 if positive", () => {
      const schema: NumberSchema = { type: 'number', minimum: 1 }
      action.modifySchema(schema)
      expect(schema.maximum).toBe(0)
    })
    test("should force maximum to 0 if undefined", () => {
      const schema: NumberSchema = { type: 'number' }
      action.modifySchema(schema)
      expect(schema.maximum).toBe(0)
    })
  })
})
