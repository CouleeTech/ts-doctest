import { MatrixParameterString, FormParameterString } from '../../Common/Util/Parameter'

const testName = 'color'
const emptyValue: any = false
const testStringValue = 'blue'
const testArrayValue = ['blue', 'black', 'brown']
const testObjectValue = { R: 100, G: 200, B: 150 }

describe('Parameter Building Functions', () => {
  it('Should include include a function that creates matrix-style parameters.', () => {
    const emptyResult = ';color'

    expect(MatrixParameterString(testName, emptyValue)).toBe(emptyResult)
    expect(MatrixParameterString(testName, emptyValue, true)).toBe(emptyResult)

    const stringResult = ';color=blue'
    const explodedStringResult = ';color=blue'

    expect(MatrixParameterString(testName, testStringValue)).toBe(stringResult)
    expect(MatrixParameterString(testName, testStringValue, true)).toBe(explodedStringResult)

    const arrayString = ';color=blue,black,brown'
    const explodedArrayString = ';color=blue;color=black;color=brown'

    expect(MatrixParameterString(testName, testArrayValue)).toBe(arrayString)
    expect(MatrixParameterString(testName, testArrayValue, true)).toBe(explodedArrayString)

    const objectString = ';color=R,100,G,200,B,150'
    const explodedObjectString = ';R=100;G=200;B=150'

    expect(MatrixParameterString(testName, testObjectValue)).toBe(objectString)
    expect(MatrixParameterString(testName, testObjectValue, true)).toBe(explodedObjectString)
  })

  it('Should include include a function that creates form-style parameters.', () => {
    const emptyResult = 'color='

    expect(FormParameterString(testName, emptyValue, false)).toBe(emptyResult)
    expect(FormParameterString(testName, emptyValue)).toBe(emptyResult)

    const stringResult = 'color=blue'
    const explodedStringResult = 'color=blue'

    expect(FormParameterString(testName, testStringValue, false)).toBe(stringResult)
    expect(FormParameterString(testName, testStringValue)).toBe(explodedStringResult)

    const arrayString = 'color=blue,black,brown'
    const explodedArrayString = 'color=blue&color=black&color=brown'

    expect(FormParameterString(testName, testArrayValue, false)).toBe(arrayString)
    expect(FormParameterString(testName, testArrayValue)).toBe(explodedArrayString)

    const objectString = 'color=R,100,G,200,B,150'
    const explodedObjectString = 'R=100&G=200&B=150'

    expect(FormParameterString(testName, testObjectValue, false)).toBe(objectString)
    expect(FormParameterString(testName, testObjectValue)).toBe(explodedObjectString)
  })
})
