import * as CircularJSON from 'circular-json-es6'

describe('Request Wrapper', () => {
  it('Should properly parse raw API responses', async () => {
    const rawResponse = { a: 'b', c: 'D' }
    const expectedResults = '{"a":"b","c":"D"}'

    // const stringified = CircularJSON.stringify(value, replacer, key, value, space)

    expect(CircularJSON.stringify(rawResponse)).toEqual(expectedResults)
  })
})
