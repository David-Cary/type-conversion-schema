import {
  ToObjectConvertor,
  TypeConversionResolver,
  DEFAULT_TYPE_CONVERTORS
} from "../src/index"

const convertor = new ToObjectConvertor()
const resolver = new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)

describe("ToObjectConvertor", () => {
  describe("convertWith", () => {
    test("should reuse the provided object by default", () => {
      const source = { x: 1}
      const value = convertor.convertWith(
        source,
        {}
      )
      expect(value).toBe(source)
    })
    describe("via create", ()=>{
      test("should populate using provided properties", () => {
        const value = convertor.convertWith(
          { x: 1 },
          {
            convertVia: {
              type: 'create',
              properties: {
                x: {},
                x2: {
                  from: ['x']
                },
                xa: {
                  from: ['x'],
                  as: 'string'
                },
                y: {
                  as: {
                    type: 'number',
                    prepare: [
                      {
                        type: 'setTo',
                        value: 0
                      }
                    ]
                  }
                },
                y2: {
                  default: 2
                }
              }
            }
          },
          resolver
        )
        expect(value).toEqual({
          x: 1,
          x2: 1,
          xa: '1',
          y: 0,
          y2: 2
        })
      })
      test("should apply typing to additional properties", () => {
        const value = convertor.convertWith(
          {
            id: 0,
            x: 1,
            y: 2
          },
          {
            convertVia: {
              type: 'create',
              properties: {
                id: {}
              },
              additionalProperties: {
                as: 'string'
              }
            }
          },
          resolver
        )
        expect(value).toEqual({
          id: 0,
          x: '1',
          y: '2'
        })
      })
      test("should allow unlisted properties if additionalProperties is set", () => {
        const value = convertor.convertWith(
          {
            id: 0,
            x: 1,
            y: 2
          },
          {
            convertVia: {
              type: 'create',
              properties: {
                id: {
                  as: 'string'
                }
              },
              additionalProperties: true
            }
          },
          resolver
        )
        expect(value).toEqual({
          id: '0',
          x: 1,
          y: 2
        })
      })
      test("should restrict selection if pick is used", () => {
        const value = convertor.convertWith(
          {
            id: 0,
            x: 1,
            y: 2
          },
          {
            convertVia: {
              type: 'create',
              properties: {
                id: {
                  as: 'string'
                }
              },
              additionalProperties: true,
              pick: ['x']
            }
          },
          resolver
        )
        expect(value).toEqual({
          id: '0',
          x: 1
        })
      })
      test("should restrict selection if omit is used", () => {
        const value = convertor.convertWith(
          {
            id: 0,
            x: 1,
            y: 2
          },
          {
            convertVia: {
              type: 'create',
              properties: {
                id: {
                  as: 'string'
                }
              },
              additionalProperties: true,
              omit: ['x']
            }
          },
          resolver
        )
        expect(value).toEqual({
          id: '0',
          y: 2
        })
      })
      test("should apply pattern matching if that's provided", () => {
        const value = convertor.convertWith(
          {
            s_id: 0,
            x: 1,
            y: 2
          },
          {
            convertVia: {
              type: 'create',
              additionalProperties: true,
              patternProperties: {
                '^s_': {
                  as: 'string'
                }
              }
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
    })
    test("should alter values with the modify action", () => {
      const value = convertor.convertWith(
        {
          x: 1
        },
        {
          finalize: [
            {
              type: 'modify',
              properties: {
                y: {
                  default: 2
                }
              }
            }
          ]
        }
      )
      expect(value).toEqual({
        x: 1,
        y: 2
      })
    })
    test("should return a shallow copy for the clone action", () => {
      const source = { x: 1}
      const value = convertor.convertWith(
        source,
        {
          finalize: ['clone']
        }
      )
      expect(value).not.toBe(source)
      expect(value).toEqual(source)
    })
    test("should remove a nested value for the delete action", () => {
      const value = convertor.convertWith(
        {
          user: {
            id: 1,
            active: true
          }
        },
        {
          finalize: [
            {
              type: 'delete',
              path: ['user', 'active']
            }
          ]
        }
      )
      expect(value).toEqual({
        user: { id: 1}
      })
    })
    test("should change nested values for set action", () => {
      const value = convertor.convertWith(
        {
          user: {
            id: 1,
            active: true
          }
        },
        {
          finalize: [
            {
              type: 'set',
              path: ['user', 'active'],
              value: false
            }
          ]
        }
      )
      expect(value).toEqual({
        user: {
          id: 1,
          active: false
        }
      })
    })
  })
})
