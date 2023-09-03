import {
  ToArrayConvertor,
  TypeConversionResolver,
  JSTypeName,
  DEFAULT_TYPE_CONVERTORS
} from "../src/index"

const convertor = new ToArrayConvertor()
const resolver = new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)

describe("ToArrayConvertor", () => {
  test("should reuse the provided array by default", () => {
    const source = [1, 2]
    const value = convertor.convertWith(
      source,
      {}
    )
    expect(value).toBe(source)
  })
  test("parse should extract array from string", () => {
    const value = convertor.convertWith(
      "[1]",
      {
        convertVia: 'parse',
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1])
  })
  test("should populate tuple using provided prefix items", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        prefixItems: [
          {
            type: 'string'
          }
        ]
      },
      resolver
    )
    expect(value).toEqual(['1'])
  })
  test("should apply typing to items", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        items: {
          type: 'string'
        }
      },
      resolver
    )
    expect(value).toEqual(['1', '2'])
  })
  test("should apply minimum item count", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        items: JSTypeName.STRING,
        minItems: 3
      },
      resolver
    )
    expect(value).toEqual(['1', '2', 'undefined'])
  })
  test("should apply maximum item count", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        items: JSTypeName.STRING,
        maxItems: 1
      },
      resolver
    )
    expect(value).toEqual(['1'])
  })
  test("should filter out duplicates if uniqueItems is active", () => {
    const value = convertor.convertWith(
      [1, 2, 1],
      {
        items: JSTypeName.STRING,
        uniqueItems: true
      },
      resolver
    )
    expect(value).toEqual(['1', '2'])
  })
  test("clone should duplicate contents", () => {
    const source = [1, 2]
    const value = convertor.convertWith(
      source,
      {
        finalize: [
          'clone'
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual(source)
    expect(value).not.toBe(source)
  })
  test("clone should use provided range", () => {
    const value = convertor.convertWith(
      [1, 2, 3],
      {
        finalize: [
          {
            type: 'clone',
            from: 1,
            to: 1
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([2])
  })
  test("clone allow negative end indices", () => {
    const value = convertor.convertWith(
      [1, 2, 3],
      {
        finalize: [
          {
            type: 'clone',
            from: 1,
            to: -2
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([2])
  })
  test("insert should default to appending an undefined value", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        finalize: [
          'insert'
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, 2, undefined])
  })
  test("insert should use the provided index", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        finalize: [
          {
            type: 'insert',
            index: -1,
            value: '-'
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, '-', 2])
  })
  test("insert allow repeated values", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        finalize: [
          {
            type: 'insert',
            index: 1,
            value: '-',
            repeat: 2
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, '-', '-', 2])
  })
  test("deleteItem should default to popping an item off the end", () => {
    const value = convertor.convertWith(
      [1, 2, 3],
      {
        finalize: [
          'deleteItem'
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, 2])
  })
  test("deleteItem should use the provided index", () => {
    const value = convertor.convertWith(
      [1, 2, 3],
      {
        finalize: [
          {
            type: 'deleteItem',
            index: -2
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, 3])
  })
  test("deleteItem should be able to drop multiple items", () => {
    const value = convertor.convertWith(
      [1, 2, 3, 4],
      {
        finalize: [
          {
            type: 'deleteItem',
            index: 1,
            count: 2
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, 4])
  })
  test("set replaces array items", () => {
    const value = convertor.convertWith(
      [1, 2],
      {
        finalize: [
          {
            type: 'set',
            path: [1],
            value: 4
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, 4])
  })
  test("set modifies item values", () => {
    const value = convertor.convertWith(
      [{x: 1, y: 0}],
      {
        finalize: [
          {
            type: 'set',
            path: [0, 'x'],
            value: 4
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([{ x: 4, y: 0 }])
  })
  test("delete removes a single item", () => {
    const value = convertor.convertWith(
      [1, 2, 3],
      {
        finalize: [
          {
            type: 'delete',
            path: [1]
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([1, 3])
  })
  test("delete can target nested values", () => {
    const value = convertor.convertWith(
      [{x: 1, y: 0}],
      {
        finalize: [
          {
            type: 'delete',
            path: [0, 'x']
          }
        ],
        items: JSTypeName.ANY
      }
    )
    expect(value).toEqual([{ y: 0 }])
  })
})
