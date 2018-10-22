import { OperationObject, PathsObject, PathItemObject, ResponseObject, RequestBodyObject } from 'openapi3-ts'

import { ContainerPaths } from '../Common/RawDocs.Container'
import { RawDocData } from '../Common/RawDocs.Interface'
import { IAilJson, IOperationObjectCollection, NO_DESCRIPTION_PROVIDED } from './Interfaces/Ail.Factory.Interfaces'
import { AilFactoryException } from './Exceptions/Ail.Factory.Exception'
import { MissingRequiredField, HasItems } from '../Common/Validation/HelperFunctions'
import { IsArray, IsObject } from '../Common/Validation/TypeChecks'
import { HttpMethodWithRequestBody } from '../Common/Http'

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
        this.ValidateRawData(path, rawData)
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

      // Each Operation object should have only one array per HTTP method
      if (!operations[type]) {
        const operationObjectArray: OperationObject[] = []
        operations[type] = operationObjectArray
      }

      // At least one response is required
      const operationType: OperationObject = {
        responses: [
          {
            [value.results!.res.status]: this.ResponseObjectFromRawData(value),
          },
        ],
      }

      if (HttpMethodWithRequestBody(type)) {
        operationType.requestBody = this.RequestBodyFromRawData(value)
      }

      operations[type].push(operationType)
    }

    return operations
  }

  protected static RequestBodyFromRawData(value: any): RequestBodyObject {
    const requestBodyObject: RequestBodyObject =
      value.requestBody && value.requestBody.description
        ? { content: value.results.req.data, description: value.requestBody.description }
        : { content: value.results.req.data }

    return requestBodyObject
  }

  /**
   * Convert a raw response object into AIL JSON
   *
   * @param res The raw result's respose object
   * @param responseBody The optional user supplied response body data
   */
  protected static ResponseObjectFromRawData(value: any): ResponseObject {
    const responseObject: ResponseObject = value.responseBody
      ? { description: value.responseBody.description ? value.responseBody.description : NO_DESCRIPTION_PROVIDED }
      : { description: NO_DESCRIPTION_PROVIDED }

    responseObject.headers = {}
    const hasResponseHeaders = !!value.responseHeaders

    for (const header of Object.keys(value.results.res.headers)) {
      responseObject.headers[header] =
        hasResponseHeaders && value.responseHeaders[header]
          ? value.responseHeaders[header].description
            ? {
                description: value.responseHeaders[header].description,
                value: value.results.res.headers[header],
              }
            : { value: value.results.res.headers[header] }
          : { value: value.results.res.headers[header] }
    }

    if (value.results.res.body) {
      responseObject.content = { 'application/json': { example: { ...value.results.res.body } } }
    }

    return responseObject
  }

  /**
   * Ensure the the raw API data is in a valid format
   *
   * This method is used before any parsing to guarentee that all required fields exist
   * in the raw API data.
   *
   * @param path The name of the path
   * @param rawData Raw API documentation data for a controller's paths
   * @throws AilFactoryException if any required field is missing
   */
  protected static ValidateRawData(path: string, rawData: RawDocData[]) {
    if (!IsArray(rawData) || !HasItems(rawData)) {
      throw new AilFactoryException(`The API path: ${path} contains no raw data`)
    }

    for (const { results } of rawData) {
      if (!IsObject(results)) {
        throw new AilFactoryException(`The API path: ${path} contained an empty results object`)
      }

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

      if (!results.req.headers) {
        throw new AilFactoryException(MissingRequiredField('headers', `The API path: ${path} result req object`))
      }

      if (!results.res) {
        throw new AilFactoryException(MissingRequiredField('res', `The API path: ${path} result object`))
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
