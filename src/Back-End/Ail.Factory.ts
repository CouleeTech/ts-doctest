import {
  OperationObject,
  PathsObject,
  PathItemObject,
  ResponseObject,
  RequestBodyObject,
  MediaTypeObject,
  ParameterObject,
  ParameterLocation,
} from 'openapi3-ts'

import { ContainerPaths } from '../Common/RawDocs.Container'
import { RawDocData, IRawHeader } from '../Common/RawDocs.Interface'
import { IAilJson, IOperationObjectCollection, NO_DESCRIPTION_PROVIDED } from './Interfaces/Ail.Factory.Interfaces'
import { AilFactoryException } from './Exceptions/Ail.Factory.Exception'
import { MissingRequiredField, HasItems } from '../Common/Validation/HelperFunctions'
import { IsArray, IsObject } from '../Common/Validation/TypeChecks'
import { HttpMethodWithRequestBody } from '../Common/Http'
import { SimpleParameterString } from '../Common/Util/ParameterString.Builder'

// The headers should be filtered out if included with raw API data
const BANNED_HEADERS = ['x-powered-by', 'etag', 'connection', 'user-agent']

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
      const type = value.results.req.method.toLowerCase()

      // Each Operation object should have only one array per HTTP method
      if (!operations[type]) {
        const operationObjectArray: OperationObject[] = []
        operations[type] = operationObjectArray
      }

      // At least one response is required
      const operationType: OperationObject = {
        responses: [
          {
            [value.results.res.status]: this.ResponseObjectFromRawData(value),
          },
        ],
      }

      if (HttpMethodWithRequestBody(type)) {
        operationType.requestBody = this.RequestBodyFromRawData(value)
      }

      if (value.parameters) {
        operationType.parameters = AilFactory.ParametersFromRawData(value)
      }

      operations[type].push(operationType)
    }

    return operations
  }

  /**
   * Convert raw API data into an array of AIL parameter objects
   *
   * @param rawData The raw API data
   */
  protected static ParametersFromRawData(rawData: RawDocData): ParameterObject[] {
    const parameters: ParameterObject[] = []

    const requestHeaders = rawData.requestHeaders
      ? this.ParseRawHeaders(rawData.results.req.headers, rawData.requestHeaders)
      : this.ParseRawHeaders(rawData.results.req.headers)

    for (const requestParameter of requestHeaders) {
      parameters.push(requestParameter)
    }

    if (rawData.parameters!.pathParameters) {
      for (const pathParam of rawData.parameters!.pathParameters) {
        parameters.push({ name: pathParam, in: 'path', required: true })
      }
    }

    if (rawData.parameters!.queryParameters) {
      const queryParams = rawData.parameters!.queryParameters
      if (IsArray(queryParams)) {
        for (const queryParam of queryParams) {
          parameters.push({ name: queryParam.key, in: 'query', example: queryParam.value })
        }
      } else {
        parameters.push({ name: queryParams.key, in: 'query', example: queryParams.value })
      }
    }

    return parameters
  }

  /**
   * Convert raw API data into an AIL request body object
   *
   * This method assumes that all included request body objects are required.
   *
   * @param rawData The raw API data
   */
  protected static RequestBodyFromRawData(rawData: RawDocData): RequestBodyObject {
    // TODO : Add a way to configure what the content media type is
    const requestBodyObject: RequestBodyObject =
      rawData.requestBody && rawData.requestBody.description
        ? {
            content: AilFactory.JsonContent(rawData.results.req.data),
            description: rawData.requestBody.description,
            required: true,
          }
        : { content: AilFactory.JsonContent(rawData.results.req.data), required: true }

    return requestBodyObject
  }

  /**
   * Convert raw API data into an AIL response object
   *
   * @param rawData The raw API data
   * @param responseBody The optional user supplied response body data
   */
  protected static ResponseObjectFromRawData(rawData: RawDocData): ResponseObject {
    const responseObject: ResponseObject = rawData.responseBody
      ? { description: rawData.responseBody.description ? rawData.responseBody.description : NO_DESCRIPTION_PROVIDED }
      : { description: NO_DESCRIPTION_PROVIDED }

    responseObject.headers = {}

    const responseHeaders = rawData.responseHeaders
      ? this.ParseRawHeaders(rawData.results.res.headers, rawData.responseHeaders)
      : this.ParseRawHeaders(rawData.results.res.headers)

    for (const { name, in: notUsed, ...properties } of responseHeaders) {
      responseObject.headers[name] = properties
    }

    if (rawData.results.res.body) {
      // TODO : Add a way to configure what the content media type is
      responseObject.content = AilFactory.JsonContent(rawData.results.res.body)
    }

    return responseObject
  }

  /**
   * Convert raw API headers into formatted AIL JSON
   *
   * @param headers Headers from a raw API request or response
   * @param headerDetails Optional details for header documentation
   */
  protected static ParseRawHeaders(
    headers: { [name: string]: string },
    headerDetails?: { [name: string]: IRawHeader },
  ): ParameterObject[] {
    const formattedHeaders: ParameterObject[] = Object.keys(headers)
      .filter(header => !BANNED_HEADERS.includes(header))
      .map(header => {
        if (headerDetails && headerDetails[header]) {
          const { value, ...options } = headerDetails[header]
          return {
            name: header,
            in: 'header' as ParameterLocation,
            example: SimpleParameterString(headers[header]),
            ...options,
          }
        }

        return {
          name: header,
          in: 'header' as ParameterLocation,
          example: SimpleParameterString(headers[header]),
        }
      })

    return formattedHeaders
  }

  /**
   * Format example content into an AIL media type object
   *
   * @param example The example content
   */
  protected static JsonContent(example: any): MediaTypeObject {
    return { 'application/json': { example: { ...example } } }
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
