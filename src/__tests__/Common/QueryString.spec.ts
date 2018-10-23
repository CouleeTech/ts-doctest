import { MatrixQueryString } from '../../Common/Util/QueryString'

describe('Query String Building Functions', () => {
  it('Should include include a function that creates matrix-style query strings.', () => {
    const testName = 'color'

    const testStringValue = 'blue'
    const stringResult = ';color=blue'
    const explodedStringResult = ';color=blue'

    expect(MatrixQueryString(testName, testStringValue)).toBe(stringResult)
    expect(MatrixQueryString(testName, testStringValue, true)).toBe(explodedStringResult)

    const testArrayValue = ['blue', 'black', 'brown']
    const arrayString = ';color=blue,black,brown'
    const explodedArrayString = ';color=blue;color=black;color=brown'

    expect(MatrixQueryString(testName, testArrayValue)).toBe(arrayString)
    expect(MatrixQueryString(testName, testArrayValue, true)).toBe(explodedArrayString)

    const testObjectValue = { R: 100, G: 200, B: 150 }
    const objectString = `;color=R,100,G,200,B,150`
    const explodedObjectString = ';R=100;G=200;B=150'

    expect(MatrixQueryString(testName, testObjectValue)).toBe(objectString)
    expect(MatrixQueryString(testName, testObjectValue, true)).toBe(explodedObjectString)
  })
})
