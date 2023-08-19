import {
  ToArrayConvertor,
  TypeConversionResolver,
  DEFAULT_TYPE_CONVERTORS
} from "../src/index"

const convertor = new ToArrayConvertor()
const resolver = new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)

describe("ToArrayConvertor", () => {
  describe("convertWith", () => {
    test("should reuse the provided array by default", () => {
      const source = [1, 2]
      const value = convertor.convertWith(
        source,
        {}
      )
      expect(value).toBe(source)
    })
    describe("via create", ()=>{
      test("should populate tuple using provided prefix items", () => {
        const value = convertor.convertWith(
          [1],
          {
            convertVia: {
              type: 'create',
              prefixItems: [
                {},
                {
                  from: [0]
                },
                {
                  from: [0],
                  as: 'string'
                },
                {
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
                {
                  default: 2
                }
              ]
            }
          },
          resolver
        )
        expect(value).toEqual([1, 1, '1', 0, 2])
      })
      test("should apply typing to additional items", () => {
        const value = convertor.convertWith(
          [0, 1, 2],
          {
            convertVia: {
              type: 'create',
              prefixItems: [{}],
              items: {
                as: 'string'
              }
            }
          },
          resolver
        )
        expect(value).toEqual([0, '1', '2'])
      })
      test("should allow unlisted items if items is set", () => {
        const value = convertor.convertWith(
          [0, 1, 2],
          {
            convertVia: {
              type: 'create',
              prefixItems: [
                {
                  as: 'string'
                }
              ],
              items: true
            }
          },
          resolver
        )
        expect(value).toEqual(['0', 1, 2])
      })
      test("should enforce unique values on additionals if uniqueItems is set", () => {
        const value = convertor.convertWith(
          [1, 2, 1, 3],
          {
            convertVia: {
              type: 'create',
              prefixItems: [{}],
              items: true,
              uniqueItems: true
            }
          },
          resolver
        )
        expect(value).toEqual([1, 2, 3])
      })
    })
    test("should alter values with the modify action", () => {
      const value = convertor.convertWith(
        [1, 2],
        {
          finalize: [
            {
              type: 'modify',
              items: {
                as: 'string'
              }
            }
          ]
        }
      )
      expect(value).toEqual(['1', '2'])
    })
    test("should return a shallow copy for the clone action", () => {
      const source = [1, 2]
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
        [
          {
            id: 1,
            active: true
          }
        ],
        {
          finalize: [
            {
              type: 'delete',
              path: [0, 'active']
            }
          ]
        }
      )
      expect(value).toEqual([
        { id: 1 }
      ])
    })
    test("should change nested values for set action", () => {
      const value = convertor.convertWith(
        [
          {
            id: 1,
            active: true
          }
        ],
        {
          finalize: [
            {
              type: 'set',
              path: [0, 'active'],
              value: false
            }
          ]
        }
      )
      expect(value).toEqual([
        {
          id: 1,
          active: false
        }
      ])
    })
  })
})
