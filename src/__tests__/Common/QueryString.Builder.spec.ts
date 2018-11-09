import { BuildQueryString, QueryStringConfig, QueryStringBuilderException } from '../../Common/Util/QueryString.Builder'

describe('Query String Building Functions', () => {
  it('Should properly build simple value query strings', () => {
    const queryPairs: Array<[QueryStringConfig, string]> = [
      [{ key: 'testKey1', value: 'testValue' }, '?testKey1=testValue'],
      [{ key: 'testKey2', value: 42 }, '?testKey2=42'],
      [{ key: 'testKey3', value: null }, '?testKey3='],
      [{ key: 'testKey4', value: undefined }, '?testKey4=']
    ]

    for (const [pair, expectedResult] of queryPairs) {
      expect(BuildQueryString(pair)).toBe(expectedResult)
    }
  })

  it('Should properly build array value query strings', () => {
    const queryPairs: Array<[QueryStringConfig, string]> = [
      [{ key: 'testKey1', value: ['testValue'] }, '?testKey1=testValue'],
      [{ key: 'testKey2', value: [42] }, '?testKey2=42'],
      [{ key: 'testKey3', value: [null] }, '?testKey3='],
      [{ key: 'testKey4', value: [undefined] }, '?testKey4='],
      [
        { key: 'testKey5', value: ['testValue1', 'testValue2', 'testValue3'] },
        '?testKey5=testValue1,testValue2,testValue3'
      ],
      [{ key: 'testKey6', value: [42, 33, 13, 9001] }, '?testKey6=42,33,13,9001'],
      [
        { key: 'testKey7', value: [null, 42, 'testValue1', null, 33, 'testValue2'] },
        '?testKey7=,42,testValue1,,33,testValue2'
      ],
      [
        { key: 'testKey8', value: [undefined, 42, 'testValue1', undefined, 33, 'testValue2'] },
        '?testKey8=,42,testValue1,,33,testValue2'
      ]
    ]

    for (const [pair, expectedResult] of queryPairs) {
      expect(BuildQueryString(pair)).toBe(expectedResult)
    }
  })

  it('Should properly build object value query strings', () => {
    const queryPairs: Array<[QueryStringConfig, string]> = [
      [{ key: 'testKey1', value: { one: 'testValue' } }, '?testKey1[one]=testValue'],
      [
        { key: 'testKey2', value: { one: 'testValue1', two: 'testValue2' } },
        '?testKey2[one]=testValue1&testKey2[two]=testValue2'
      ],
      [
        { key: 'testKey3', value: { one: 'testValue', two: 42, three: null } },
        '?testKey3[one]=testValue&testKey3[two]=42&testKey3[three]='
      ],
      [
        { key: 'testKey4', value: { one: 'testValue', two: 42, three: undefined } },
        '?testKey4[one]=testValue&testKey4[two]=42&testKey4[three]='
      ]
    ]

    for (const [pair, expectedResult] of queryPairs) {
      expect(BuildQueryString(pair)).toBe(expectedResult)
    }
  })

  it('Should properly query strings that have an array of pairs', () => {
    const queryPairs: Array<[QueryStringConfig, string]> = [
      [
        [
          { key: 'testKey1', value: { one: 'testValue' } },
          { key: 'testKey2', value: 42 },
          { key: 'testKey3', value: null },
          { key: 'testKey4', value: [undefined] }
        ],
        '?testKey1[one]=testValue&testKey2=42&testKey3=&testKey4='
      ],
      [
        [
          { key: 'testKey1', value: ['testValue'] },
          { key: 'testKey2', value: [42] },
          { key: 'testKey3', value: [null] },
          { key: 'testKey4', value: [undefined] }
        ],
        '?testKey1=testValue&testKey2=42&testKey3=&testKey4='
      ],
      [
        [
          { key: 'testKey1', value: { one: 'testValue' } },
          { key: 'testKey2', value: 42 },
          { key: 'testKey3', value: { one: 'testValue', two: 42, three: undefined } },
          { key: 'testKey4', value: { one: 'testValue1', two: 'testValue2', three: 33, four: 'testValue3' } }
        ],
        '?testKey1[one]=testValue&testKey2=42&testKey3[one]=testValue&testKey3[two]=42&testKey3[three]=' +
          '&testKey4[one]=testValue1&testKey4[two]=testValue2&testKey4[three]=33&testKey4[four]=testValue3'
      ]
    ]

    for (const [pair, expectedResult] of queryPairs) {
      expect(BuildQueryString(pair)).toBe(expectedResult)
    }
  })

  it('Should throw error for invalid query value types', () => {
    const invalidValues: any[] = [[], null, undefined]

    for (const pair of invalidValues) {
      expect(() => BuildQueryString(pair)).toThrow(QueryStringBuilderException)
    }
  })
})
