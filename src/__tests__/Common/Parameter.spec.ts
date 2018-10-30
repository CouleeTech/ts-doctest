import {
  MatrixParameterString,
  FormParameterString,
  LabelParameterString,
  ParameterException,
  SimpleParameterString,
  SpaceDelimitedParameterString,
  PipeDelimitedParameterString,
  DeepObjectParameterString,
} from '../../Common/Util/ParameterString.Builder'

const testName = 'color'
const emptyValue: any = false
const testStringValue = 'blue'
const testArrayValue = ['blue', 'black', 'brown']
const testObjectValue = { R: 100, G: 200, B: 150 }

describe('Parameter Building Functions', () => {
  it('Should include include a function that builds form-style parameters.', () => {
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

  it('Should include include a function that builds label-style parameters.', () => {
    const emptyResult = '.'

    expect(LabelParameterString(emptyValue)).toBe(emptyResult)
    expect(LabelParameterString(emptyValue, true)).toBe(emptyResult)

    const stringResult = '.blue'
    const explodedStringResult = '.blue'

    expect(LabelParameterString(testStringValue)).toBe(stringResult)
    expect(LabelParameterString(testStringValue, true)).toBe(explodedStringResult)

    const arrayString = '.blue.black.brown'
    const explodedArrayString = '.blue.black.brown'

    expect(LabelParameterString(testArrayValue)).toBe(arrayString)
    expect(LabelParameterString(testArrayValue, true)).toBe(explodedArrayString)

    const objectString = '.R.100.G.200.B.150'
    const explodedObjectString = '.R=100.G=200.B=150'

    expect(LabelParameterString(testObjectValue)).toBe(objectString)
    expect(LabelParameterString(testObjectValue, true)).toBe(explodedObjectString)
  })

  it('Should include include a function that builds matrix-style parameters.', () => {
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

  it('Should include include a function that builds simple-style parameters.', () => {
    expect(() => SimpleParameterString(emptyValue)).toThrow(ParameterException)
    expect(() => SimpleParameterString(emptyValue, true)).toThrow(ParameterException)

    const stringResult = 'blue'
    const explodedStringResult = 'blue'

    expect(SimpleParameterString(testStringValue)).toBe(stringResult)
    expect(SimpleParameterString(testStringValue, true)).toBe(explodedStringResult)

    const arrayString = 'blue,black,brown'
    const explodedArrayString = 'blue,black,brown'

    expect(SimpleParameterString(testArrayValue)).toBe(arrayString)
    expect(SimpleParameterString(testArrayValue, true)).toBe(explodedArrayString)

    const objectString = 'R,100,G,200,B,150'
    const explodedObjectString = 'R=100,G=200,B=150'

    expect(SimpleParameterString(testObjectValue)).toBe(objectString)
    expect(SimpleParameterString(testObjectValue, true)).toBe(explodedObjectString)
  })

  it('Should include include a function that builds space-delimited parameters.', () => {
    expect(() => SpaceDelimitedParameterString(emptyValue)).toThrow(ParameterException)
    expect(() => SpaceDelimitedParameterString(testStringValue)).toThrow(ParameterException)
    const arrayString = 'blue%20black%20brown'
    expect(SpaceDelimitedParameterString(testArrayValue)).toBe(arrayString)
    const objectString = 'R%20100%20G%20200%20B%20150'
    expect(SpaceDelimitedParameterString(testObjectValue)).toBe(objectString)
  })

  it('Should include include a function that builds pipe-delimited parameters.', () => {
    expect(() => PipeDelimitedParameterString(emptyValue)).toThrow(ParameterException)
    expect(() => PipeDelimitedParameterString(testStringValue)).toThrow(ParameterException)
    const arrayString = 'blue|black|brown'
    expect(PipeDelimitedParameterString(testArrayValue)).toBe(arrayString)
    const objectString = 'R|100|G|200|B|150'
    expect(PipeDelimitedParameterString(testObjectValue)).toBe(objectString)
  })

  it('Should include include a function that builds deep object parameters.', () => {
    expect(() => DeepObjectParameterString(testName, emptyValue)).toThrow(ParameterException)
    expect(() => DeepObjectParameterString(testName, testStringValue)).toThrow(ParameterException)
    expect(() => DeepObjectParameterString(testName, testArrayValue)).toThrow(ParameterException)
    const objectString = 'color[R]=100&color[G]=200&color[B]=150'
    expect(DeepObjectParameterString(testName, testObjectValue)).toBe(objectString)
  })
})
