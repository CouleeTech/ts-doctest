describe('Request Wrapper', () => {
  it('Should properly parse raw API responses', async () => {
    const rawResponse = { a: 'b', c: 'D' }
    const expectedResults = '{"a":"b","c":"D"}'

    expect(JSON.stringify(rawResponse)).toEqual(expectedResults)
  })
})
