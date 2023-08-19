import { ToBigIntConvertor } from "../src/index"

const convertor = new ToBigIntConvertor()

test("x", ()=> {
  expect(true).toBe(true)
})

describe("ToBigIntConvertor", () => {
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
      expect(value).toEqual(0n)
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
      expect(value).toBe(1n)
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
      expect(value).toBe(0n)
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
      expect(value).toBe(1n)
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
      expect(value).toBe(4n)
    })
  })
  describe("positive action", () => {
    test("should flip negative numbers", () => {
      const value = convertor.convertWith(-1, { finalize: ['positive'] })
      expect(value).toBe(1n)
    })
  })
  describe("negative action", () => {
    test("should flip positive numbers", () => {
      const value = convertor.convertWith(1, { finalize: ['negative'] })
      expect(value).toBe(-1n)
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
      expect(value).toBe(5n)
    })
  })
})
