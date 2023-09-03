import {
  ToObjectConvertor,
  TypeConversionResolver,
  JSTypeName,
  DEFAULT_TYPE_CONVERTORS
} from "../src/index"

const convertor = new ToObjectConvertor()
const resolver = new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)

describe("ToObjectConvertor", () => {
  test("should reuse the provided object by default", () => {
    const source = { x: 1}
    const value = convertor.convertWith(
      source,
      {}
    )
    expect(value).toBe(source)
  })
  test("should populate using provided properties", () => {
    const value = convertor.convertWith(
      { x: 1 },
      {
        properties: {
          x: JSTypeName.STRING
        }
      },
      resolver
    )
    expect(value).toEqual({
      x: '1'
    })
  })
  test("should trim extra value if there are no additional properties", () => {
    const value = convertor.convertWith(
      { x: 1, y: 2 },
      {
        properties: {
          x: JSTypeName.STRING
        }
      },
      resolver
    )
    expect(value).toEqual({
      x: '1'
    })
  })
  test("should keep properties if additional properties is defined", () => {
    const value = convertor.convertWith(
      { x: 1, y: 2 },
      {
        properties: {
          x: JSTypeName.STRING
        },
        additionalProperties: JSTypeName.ANY
      },
      resolver
    )
    expect(value).toEqual({
      x: '1',
      y: 2
    })
  })
  test("should apply pattern properties if provided", () => {
    const value = convertor.convertWith(
      { s_id: 0, x: 1, y: 2 },
      {
        additionalProperties: JSTypeName.ANY,
        patternProperties: {
          '^s_': JSTypeName.STRING
        }
      },
      resolver
    )
    expect(value).toEqual({
      s_id: '0',
      x: 1,
      y: 2
    })
  })
  test("wrap should enclose a value in an object", () => {
    const value = convertor.convertWith(
      1,
      {
        convertVia: 'wrap',
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ value: 1 })
  })
  test("wrap should use the provided key", () => {
    const value = convertor.convertWith(
      1,
      {
        convertVia: {
          type: 'wrap',
          key: 'x'
        },
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ x: 1 })
  })
  test("set should use the copy path if one is provided", () => {
    const value = convertor.convertWith(
      { x: 1 },
      {
        finalize: [
          {
            type: 'set',
            from: 'x',
            path: 'x2'
          }
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ x: 1, x2: 1 })
  })
  test("set should fallback on default if copy result is undefined", () => {
    const value = convertor.convertWith(
      { x: 1 },
      {
        finalize: [
          {
            type: 'set',
            from: 'y',
            path: 'y2',
            default: 0
          }
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ x: 1, y2: 0 })
  })
  test("set should use provided value if there's no copy path", () => {
    const value = convertor.convertWith(
      { x: 1 },
      {
        finalize: [
          {
            type: 'set',
            path: 'x2',
            value: 2
          }
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ x: 1, x2: 2 })
  })
  test("set should create wrapper objects as needed", () => {
    const value = convertor.convertWith(
      { x: 1 },
      {
        finalize: [
          {
            type: 'set',
            from: 'x',
            path: [
              'coords',
              0,
              'x'
            ]
          }
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ x: 1, coords: [ { x: 1 } ] })
  })
  test("delete should remove the target value", () => {
    const value = convertor.convertWith(
      { x: 1, y: 2 },
      {
        finalize: [
          {
            type: 'delete',
            path: 'x'
          }
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ y: 2 })
  })
  test("omit should return a copy by default", () => {
    const source = { x: 1, y: 2 }
    const value = convertor.convertWith(
      source,
      {
        finalize: [
          'omit'
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ x: 1, y: 2 })
    expect(value).not.toBe(source)
  })
  test("omit should exclude listed properties", () => {
    const value = convertor.convertWith(
      { x: 1, y: 2 },
      {
        finalize: [
          {
            type: 'omit',
            properties: ['x']
          }
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ y: 2 })
  })
  test("pick should return an empty copy by default", () => {
    const source = { x: 1, y: 2 }
    const value = convertor.convertWith(
      source,
      {
        finalize: [
          'pick'
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({})
    expect(value).not.toBe(source)
  })
  test("pick should only include listed properties", () => {
    const value = convertor.convertWith(
      { x: 1, y: 2 },
      {
        finalize: [
          {
            type: 'pick',
            properties: ['x']
          }
        ],
        additionalProperties: JSTypeName.ANY
      }
    )
    expect(value).toEqual({ x: 1 })
  })
})
