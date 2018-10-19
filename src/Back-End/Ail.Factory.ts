import { OperationObject, PathsObject, PathItemObject } from 'openapi3-ts'

import { ContainerPaths } from '../Common/RawDocs.Container'
import { RawDocData } from '../Common/RawDocs.Interface'
import { IAilJson, IOperationObjectCollection } from './Interfaces/Ail.Factory.Interfaces'
import { AilFactoryException } from './Exceptions/Ail.Factory.Exception'
import { MissingRequiredField } from '../Common/Validation/HelperFunctions'

/**
 * Used to create AIL JSON objects
 *
 * AIL JSON is an extended subset of OpenAPI 3.0.0
 */
export class AilFactory {
  private static readonly AIL_VERSION = '0.1.0'
  private static readonly OPEN_API_VERSION = '3.0.0'

  /**
   * This class should never be instantiated
   */
  protected constructor() {}

  /**
   * Converts an array of API results into an AIL JSON object
   *
   * @param controller The name of the controller the results belong to
   * @param rawPaths Raw API documentation data for a controller's paths
   */
  public static Create(controller: string, rawPaths: ContainerPaths): IAilJson {
    const ailJson: IAilJson = {
      ailVersion: this.AIL_VERSION,
      dateCreated: Date.now(),
      openApiVersion: this.OPEN_API_VERSION,
      controller,
      paths: rawPaths.map(([path, rawData]) => {
        this.ValidateRawData(rawData)
        return this.RawPathToAil(path, rawData)
      }),
    }

    return ailJson
  }

  /**
   * Convert the raw path data into an AIL Paths Object
   *
   * @param path The name of the path
   * @param rawData Raw data associated with the path and its operations
   */
  protected static RawPathToAil(path: string, rawData: RawDocData[]): PathsObject {
    const pathAilItem: PathItemObject = {
      ...this.RawOperationsToAil(rawData),
    }

    const pathAil: PathsObject = {
      [path]: pathAilItem,
    }

    return pathAil
  }

  /**
   * Convert the raw path operations into an object with keys containing OperationObjects
   *
   * @param rawData Raw data associated with the path and its operations
   */
  protected static RawOperationsToAil(rawData: RawDocData[]): IOperationObjectCollection {
    const operations: IOperationObjectCollection = {}

    for (const value of rawData) {
      const type = value.results!.req.method.toLowerCase()

      if (!operations[type]) {
        const operationObjectArray: OperationObject[] = []
        operations[type] = operationObjectArray
      }

      const operationType: OperationObject = {
        responses: [],
      }

      operations[type].push(operationType)
    }

    return operations
  }

  /**
   * Ensure the the raw API data is in a valid format
   *
   * @param rawData Raw API documentation data for a controller's paths
   * @throws AilFactoryException if any required field is missing
   */
  protected static ValidateRawData(rawData: RawDocData[]) {
    for (const { path, results } of rawData) {
      if (!results) {
        throw new AilFactoryException(MissingRequiredField('results', `The API path: ${path}`))
      }

      if (!results.req) {
        throw new AilFactoryException(MissingRequiredField('req', `The API path: ${path} result object`))
      }

      if (!results.req.method) {
        throw new AilFactoryException(MissingRequiredField('method', `The API path: ${path} result req object`))
      }

      if (!results.req.url) {
        throw new AilFactoryException(MissingRequiredField('url', `The API path: ${path} result req object`))
      }

      if (!results.req.data) {
        throw new AilFactoryException(MissingRequiredField('data', `The API path: ${path} result req object`))
      }

      if (!results.req.headers) {
        throw new AilFactoryException(MissingRequiredField('headers', `The API path: ${path} result req object`))
      }

      if (!results.res) {
        throw new AilFactoryException(MissingRequiredField('res', `The API path: ${path} result object`))
      }

      if (!results.res.body) {
        throw new AilFactoryException(MissingRequiredField('body', `The API path: ${path} result req object`))
      }

      if (!results.res.headers) {
        throw new AilFactoryException(MissingRequiredField('headers', `The API path: ${path} result req object`))
      }

      if (!results.res.status) {
        throw new AilFactoryException(MissingRequiredField('status', `The API path: ${path} result req object`))
      }
    }
  }
}
