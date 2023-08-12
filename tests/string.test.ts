import {
  ToStringConvertor,
  PadStringAction,
  StringSliceAction,
  DateStringAction
} from "../src/index"
import { type JSONSchema } from 'json-schema-typed'

const convertor = new ToStringConvertor()

describe("ToStringConvertor", () => {
  describe("default action", () => {
    test("should use default value if target value is undefined", () => {
      const value = convertor.convertWith(
        undefined,
        [
          {
            type: 'default',
            value: 'x'
          }
        ]
      )
      expect(value).toBe('x')
    })
  })
  describe("setTo action", () => {
    test("should override the provided value", () => {
      const value = convertor.convertWith(
        'a',
        [
          {
            type: 'setTo',
            value: 'x'
          }
        ]
      )
      expect(value).toBe('x')
    })
  })
  describe("stringify action", () => {
    test("should join the provided array", () => {
      const value = convertor.convertWith({ x: 1 }, ['stringify'])
      expect(value).toBe('{"x":1}')
    })
  })
  describe("join action", () => {
    test("should join the provided array", () => {
      const value = convertor.convertWith(
        ['a', 'b'],
        [
          {
            type: 'join',
            with: '-'
          }
        ]
      )
      expect(value).toBe('a-b')
    })
  })
  describe("pad action", () => {
    test("should add to end by default", () => {
      const value = convertor.convertWith(
        'x',
        [
          {
            type: 'pad',
            length: 3
          }
        ]
      )
      expect(value).toBe('x  ')
    })
    test("should add to start if specific", () => {
      const value = convertor.convertWith(
        'x',
        [
          {
            type: 'pad',
            length: 3,
            atStart: true
          }
        ]
      )
      expect(value).toBe('  x')
    })
    test("should use provided text", () => {
      const value = convertor.convertWith(
        'x',
        [
          {
            type: 'pad',
            length: 3,
            text: '-?'
          }
        ]
      )
      expect(value).toBe('x-?')
    })
  })
  describe("slice action", () => {
    test("should return a targetted substring", () => {
      const value = convertor.convertWith(
        'raccoon',
        [
          {
            type: 'slice',
            start: 1,
            end: -1
          }
        ]
      )
      expect(value).toBe('accoo')
    })
  })
  describe("replace action", () => {
    test("should repeat it all is set", () => {
      const value = convertor.convertWith(
        'boot',
        [
          {
            type: 'replace',
            pattern: 'o',
            replacement: 'e',
            all: true
          }
        ]
      )
      expect(value).toBe('beet')
    })
  })
  describe("insert action", () => {
    test("should default to appending", () => {
      const value = convertor.convertWith(
        'dog',
        [
          {
            type: 'insert',
            text: 'house'
          }
        ]
      )
      expect(value).toBe('doghouse')
    })
    test("should add at postion", () => {
      const value = convertor.convertWith(
        'dog',
        [
          {
            type: 'insert',
            text: 'u',
            position: 2
          }
        ]
      )
      expect(value).toBe('doug')
    })
    test("should add at postion from end", () => {
      const value = convertor.convertWith(
        'dog',
        [
          {
            type: 'insert',
            text: 'u',
            position: -1
          }
        ]
      )
      expect(value).toBe('doug')
    })
  })
  describe("lowerCase action", () => {
    test("should convert to lower case", () => {
      const value = convertor.convertWith('Bob', ['lowerCase'])
      expect(value).toBe('bob')
    })
  })
  describe("upperCase action", () => {
    test("should convert to upper case", () => {
      const value = convertor.convertWith('Bob', ['upperCase'])
      expect(value).toBe('BOB')
    })
  })
  describe("date", () => {
    test("should convert to date", () => {
      const value = convertor.convertWith(
        '01 Jan 1990 03:24:00',
        [
          {
            type: 'date',
            locales: 'en-US'
          }
        ]
      )
      expect(value).toBe('1/1/1990')
    })
  })
  describe("time", () => {
    test("should convert to time", () => {
      const value = convertor.convertWith(
        '01 Jan 1990 03:24:00',
        [
          {
            type: 'time',
            locales: 'en-US'
          }
        ]
      )
      expect(value).toBe('3:24:00 AM')
    })
  })
  describe("dateTime", () => {
    test("should convert to date and time", () => {
      const value = convertor.convertWith(
        '01 Jan 1990 03:24:00',
        [
          {
            type: 'dateTime',
            locales: 'en-US'
          }
        ]
      )
      expect(value).toBe('1/1/1990, 3:24:00 AM')
    })
  })
})

describe("PadStringAction", () => {
  const action = new PadStringAction()
  describe("modifySchema", () => {
    test("should set minLength", () => {
      const schema: JSONSchema = { type: 'string' }
      action.modifySchema(schema, { length: 2 })
      expect(schema.minLength).toBe(2)
    })
  })
})

describe("StringSliceAction", () => {
  const action = new StringSliceAction()
  describe("modifySchema", () => {
    test("should set maxLength if both positions are positive", () => {
      const schema: JSONSchema = { type: 'string' }
      action.modifySchema(schema, { start: 1, end: 3 })
      expect(schema.maxLength).toBe(2)
    })
  })
  describe("modifySchema", () => {
    test("should set maxLength if both positions are negative", () => {
      const schema: JSONSchema = { type: 'string' }
      action.modifySchema(schema, { start: -3, end: -1 })
      expect(schema.maxLength).toBe(2)
    })
  })
  describe("modifySchema", () => {
    test("should not set maxLength if both positions have different signs", () => {
      const schema: JSONSchema = { type: 'string' }
      action.modifySchema(schema, { start: 1, end: -1 })
      expect(schema.maxLength).toBeUndefined()
    })
  })
})

describe("DateStringAction", () => {
  const action = new DateStringAction()
  describe("modifySchema", () => {
    test("should set format", () => {
      const schema: JSONSchema = { type: 'string' }
      action.modifySchema(schema)
      expect(schema.format).toBe('date')
    })
  })
})
