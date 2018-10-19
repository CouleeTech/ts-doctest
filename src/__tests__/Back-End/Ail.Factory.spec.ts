import { PathsObject, PathItemObject } from 'openapi3-ts'

import { AilFactory } from '../../Back-End/Ail.Factory'
import { RawDocData } from '../../Common'
import { AilFactoryException } from '../../Back-End/Exceptions/Ail.Factory.Exception'

import { invalidRawData, validRawData } from '../Payloads/RawApi.Payloads'

class MockAilFactory extends AilFactory {
  public static rawToAil = (path: string, rawData: RawDocData[]) => MockAilFactory.RawPathToAil(path, rawData)
  public static validateRawDataInTest = (path: string, rawData: RawDocData[]) =>
    MockAilFactory.ValidateRawData(path, rawData)
}

interface IRawData {
  path: string
  rawData: RawDocData[]
}

const mockPathName = '/test'
const mockRawData: IRawData = {
  path: mockPathName,
  rawData: [
    {
      path: mockPathName,
      results: {
        req: { method: 'GET' },
        res: {},
      },
    },
  ],
}
const pathOperations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

beforeAll(() => {})

describe('AIL Factory', () => {
  it('RawPathToAil should return a valid PathsObject', () => {
    const { path, rawData } = mockRawData
    const pathObject: PathsObject = MockAilFactory.rawToAil(path, rawData)
    validatePathsObject(path, pathObject)
  })

  it('ValidateRawData should throw exceptions for invalid data', () => {
    const path = 'TEST'
    const trials = invalidRawData()
    for (const trial of trials) {
      expect(() => MockAilFactory.validateRawDataInTest(path, trial as any)).toThrow(AilFactoryException)
    }
  })

  it('ValidateRawData should not throw exceptions for valid data', () => {
    const path = 'TEST'
    const trials = validRawData()
    for (const trial of trials) {
      expect(() => MockAilFactory.validateRawDataInTest(path, trial as any))
    }
  })
})

function validatePathsObject(path: string, pathObject: PathsObject) {
  // There should only ever be one key per path object
  expect(Object.keys(pathObject).length).toBe(1)
  // The one key should be the name of the path
  expect(pathObject).toHaveProperty(path)
  validatePathsItemObject(pathObject[path])
}

function validatePathsItemObject(item: PathItemObject) {
  // The path item object should have atleast one operation property
  const itemKeys = Object.keys(item)
  const matchingOperations = pathOperations.filter(op => -1 !== itemKeys.indexOf(op))
  expect(matchingOperations.length).toBeGreaterThan(0)
}
