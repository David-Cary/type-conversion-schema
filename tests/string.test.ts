import {
  ToStringConvertor,
  TypeConversionSchema
} from "../src/index"

const convertor = new ToStringConvertor()

describe("ToStringConvertor", () => {
  describe("default value", () => {
    test("should use default value if target value is undefined", () => {
      const value = convertor.convertWith(
        undefined,
        {
          default: 'x'
        }
      )
      expect(value).toBe('x')
    })
  })
  describe("const value", () => {
    test("should override the provided value", () => {
      const value = convertor.convertWith(
        'a',
        {
          const: 'x'
        }
      )
      expect(value).toBe('x')
    })
  })
  describe("stringify action", () => {
    test("should join the provided array", () => {
      const value = convertor.convertWith(
        { x: 1 },
        {
          convertVia: 'stringify'
        }
      )
      expect(value).toBe('{"x":1}')
    })
  })
  describe("join action", () => {
    test("should join the provided array", () => {
      const value = convertor.convertWith(
        ['a', 'b'],
        {
          convertVia: {
            type: 'join',
            with: '-'
          }
        }
      )
      expect(value).toBe('a-b')
    })
  })
  describe("pad action", () => {
    test("should add to end by default", () => {
      const value = convertor.convertWith(
        'x',
        {
          finalize: [
            {
              type: 'pad',
              length: 3
            }
          ]
        }
      )
      expect(value).toBe('x  ')
    })
    test("should add to start if specific", () => {
      const value = convertor.convertWith(
        'x',
        {
          finalize: [
            {
              type: 'pad',
              length: 3,
              atStart: true
            }
          ]
        }
      )
      expect(value).toBe('  x')
    })
    test("should use provided text", () => {
      const value = convertor.convertWith(
        'x',
        {
          finalize: [
            {
              type: 'pad',
              length: 3,
              text: '-?'
            }
          ]
        }
      )
      expect(value).toBe('x-?')
    })
    test("should set min length when applied to schema", () => {
      const schema: TypeConversionSchema = {
        type: 'string',
        finalize: [
          {
            type: 'pad',
            length: 3
          }
        ]
      }
      convertor.expandSchema(schema)
      expect('minLength' in schema).toBe(true)
      if('minLength' in schema) {
        expect(schema.minLength).toBe(3)
      }
    })
  })
  describe("slice action", () => {
    test("should return a targetted substring", () => {
      const value = convertor.convertWith(
        'raccoon',
        {
          finalize: [
            {
              type: 'slice',
              start: 1,
              end: -1
            }
          ]
        }
      )
      expect(value).toBe('accoo')
    })
    test("should set max length of schema when signs are same", () => {
      const schema: TypeConversionSchema = {
        type: 'string',
        finalize: [
          {
            type: 'slice',
            start: 1,
            end: 4
          }
        ]
      }
      convertor.expandSchema(schema)
      expect('maxLength' in schema).toBe(true)
      if('maxLength' in schema) {
        expect(schema.maxLength).toBe(3)
      }
    })
  })
  describe("replace action", () => {
    test("should repeat it all is set", () => {
      const value = convertor.convertWith(
        'boot',
        {
          finalize: [
            {
              type: 'replace',
              pattern: 'o',
              replacement: 'e',
              all: true
            }
          ]
        }
      )
      expect(value).toBe('beet')
    })
  })
  describe("insert action", () => {
    test("should default to appending", () => {
      const value = convertor.convertWith(
        'dog',
        {
          finalize: [
            {
              type: 'insert',
              text: 'house'
            }
          ]
        }
      )
      expect(value).toBe('doghouse')
    })
    test("should add at postion", () => {
      const value = convertor.convertWith(
        'dog',
        {
          finalize: [
            {
              type: 'insert',
              text: 'u',
              position: 2
            }
          ]
        }
      )
      expect(value).toBe('doug')
    })
    test("should add at postion from end", () => {
      const value = convertor.convertWith(
        'dog',
        {
          finalize: [
            {
              type: 'insert',
              text: 'u',
              position: -1
            }
          ]
        }
      )
      expect(value).toBe('doug')
    })
  })
  describe("lowerCase action", () => {
    test("should convert to lower case", () => {
      const value = convertor.convertWith(
        'Bob',
        {
          finalize: ['lowerCase']
        }
      )
      expect(value).toBe('bob')
    })
  })
  describe("upperCase action", () => {
    test("should convert to upper case", () => {
      const value = convertor.convertWith(
        'Bob',
        {
          finalize: ['upperCase']
        }
      )
      expect(value).toBe('BOB')
    })
  })
  describe("date", () => {
    test("should convert to date", () => {
      const value = convertor.convertWith(
        '01 Jan 1990 03:24:00',
        {
          convertVia: {
            type: 'date',
            locales: 'en-US'
          }
        }
      )
      expect(value).toBe('1/1/1990')
    })
    test("should format when applied to schema", () => {
      const schema: TypeConversionSchema = {
        type: 'string',
        convertVia: {
          type: 'date',
          locales: 'en-US'
        }
      }
      convertor.expandSchema(schema)
      expect('format' in schema).toBe(true)
      if('format' in schema) {
        expect(schema.format).toBe('date')
      }
    })
  })
  describe("time", () => {
    test("should convert to time", () => {
      const value = convertor.convertWith(
        '01 Jan 1990 03:24:00',
        {
          convertVia: {
            type: 'time',
            locales: 'en-US'
          }
        }
      )
      expect(value).toBe('3:24:00 AM')
    })
  })
  describe("dateTime", () => {
    test("should convert to date and time", () => {
      const value = convertor.convertWith(
        '01 Jan 1990 03:24:00',
        {
          convertVia: {
            type: 'dateTime',
            locales: 'en-US'
          }
        }
      )
      expect(value).toBe('1/1/1990, 3:24:00 AM')
    })
  })
})
