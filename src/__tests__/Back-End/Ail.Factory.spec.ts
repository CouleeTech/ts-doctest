import { PathItemObject } from 'openapi3-ts'

import { AilFactory } from '../../Back-End/Ail.Factory'
import { RawDocData } from '../../Common'
import { AilFactoryException } from '../../Back-End/Exceptions/Ail.Factory.Exception'

import { invalidRawData, validRawData, validRawApiResponse } from '../Payloads/RawApi.Payloads'

class MockAilFactory extends AilFactory {
  public static rawToAil = (path: string, rawData: RawDocData[]) =>
    MockAilFactory.RawPathToAil(path, rawData, { description: '' })
  public static validateRawDataInTest = (path: string, rawData: RawDocData[]) =>
    MockAilFactory.ValidateRawData(path, rawData)
}

const pathOperations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

beforeAll(() => {})

describe('AIL Factory', () => {
  it('RawPathToAil should return a valid PathsObject', () => {
    const rawApiData = validRawApiResponse()
    for (const path of rawApiData) {
      const pathObject: [string, PathItemObject] = MockAilFactory.rawToAil(path[0] as string, path[1] as any)
      validatePathsObject(pathObject)
    }
  })

  it('should use the ValidateRawData method to throw exceptions for invalid data', () => {
    const path = 'TEST'
    const trials = invalidRawData()
    for (const trial of trials) {
      expect(() => MockAilFactory.validateRawDataInTest(path, trial as any)).toThrow(AilFactoryException)
    }
  })

  it('should not have any issues while validating valid raw API data using the ValidateRawData method', () => {
    const path = 'TEST'
    const trials = validRawData()
    for (const trial of trials) {
      expect(() => MockAilFactory.validateRawDataInTest(path, trial as any))
    }
    for (const validPath of validRawApiResponse()) {
      expect(() => MockAilFactory.validateRawDataInTest(validPath[0] as string, validPath[1] as any))
    }
  })
})

function validatePathsObject(pathObject: [string, PathItemObject]) {
  const [pathName, pathObjectItem] = pathObject
  expect(pathName).toBeTruthy()
  validatePathsItemObject(pathObjectItem)
}

function validatePathsItemObject(item: PathItemObject) {
  // The path item object should have atleast one operation property
  const itemKeys = Object.keys(item)
  const matchingOperations = pathOperations.filter(op => -1 !== itemKeys.indexOf(op))
  expect(matchingOperations.length).toBeGreaterThan(0)
}
