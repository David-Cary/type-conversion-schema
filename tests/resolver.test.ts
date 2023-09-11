import {
  TypeConversionResolver,
  JSTypeName,
  DEFAULT_TYPE_CONVERTORS
} from "../src/index"

const resolver = new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)

describe("TypeConversionResolver", () => {
  describe("getRequestSchema", () => {
    test("should convert type name to an schema", () => {
      const schema = resolver.getRequestSchema(JSTypeName.STRING)
      expect(schema).toEqual({ type: 'string' })
    })
    test("should return first matching schema of union", () => {
      const schema = resolver.getRequestSchema(
        {
          anyOf: [
            JSTypeName.NUMBER,
            JSTypeName.STRING
          ]
        },
        "hi"
      )
      expect(schema).toEqual({ type: 'string' })
    })
    test("should resolve references from context", () => {
      const schema = resolver.getRequestSchema(
        {
          $ref: 'name'
        },
        null,
        {
          schemas: {
            'name': {
              type: JSTypeName.STRING
            }
          }
        }
      )
      expect(schema).toEqual({ type: 'string' })
    })
    test("should use parent context to resolves references", () => {
      const schema = resolver.getRequestSchema(
        {
          $ref: '#/$defs/name'
        },
        null,
        {
          schemas: {},
          parent: {
            type: JSTypeName.OBJECT,
            $defs: {
              'name': {
                type: JSTypeName.STRING
              }
            }
          }
        }
      )
      expect(schema).toEqual({ type: 'string' })
    })
    test("should return the request if it's already a schema", () => {
      const source = { type: JSTypeName.STRING }
      const schema = resolver.getRequestSchema(source)
      expect(schema).toBe(source)
    })
  })
  describe("convert", () => {
    test("should perform the provided conversion", () => {
      const results = resolver.convert(
        1,
        {
          type: 'string'
        }
      )
      expect(results).toEqual('1')
    })
  })
})
