import { MatrixParameterString } from '../../Common/Util/Parameter'

describe('Parameter Building Functions', () => {
  it('Should include include a function that creates matrix-style parameter.', () => {
    const testName = 'color'

    const testStringValue = 'blue'
    const stringResult = ';color=blue'
    const explodedStringResult = ';color=blue'

    expect(MatrixParameterString(testName, testStringValue)).toBe(stringResult)
    expect(MatrixParameterString(testName, testStringValue, true)).toBe(explodedStringResult)

    const testArrayValue = ['blue', 'black', 'brown']
    const arrayString = ';color=blue,black,brown'
    const explodedArrayString = ';color=blue;color=black;color=brown'

    expect(MatrixParameterString(testName, testArrayValue)).toBe(arrayString)
    expect(MatrixParameterString(testName, testArrayValue, true)).toBe(explodedArrayString)

    const testObjectValue = { R: 100, G: 200, B: 150 }
    const objectString = `;color=R,100,G,200,B,150`
    const explodedObjectString = ';R=100;G=200;B=150'

    expect(MatrixParameterString(testName, testObjectValue)).toBe(objectString)
    expect(MatrixParameterString(testName, testObjectValue, true)).toBe(explodedObjectString)
  })
})
