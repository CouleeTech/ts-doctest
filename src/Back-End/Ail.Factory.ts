import {
  OperationObject,
  PathItemObject,
  ResponseObject,
  RequestBodyObject,
  MediaTypeObject,
  ParameterObject,
  ParameterLocation,
  SchemaObject
} from 'openapi3-ts'

import { HttpMethodWithRequestBody } from '../Common/Http'
import { ContainerPaths, IOptionalContainerContents } from '../Common/RawDocs.Container'
import { RawDocData, IRawHeader } from '../Common/RawDocs.Interface'
import { SimpleParameterString } from '../Common/Util/ParameterString.Builder'
import { BuildQueryString, IsQueryPairArray, QueryStringConfig } from '../Common/Util/QueryString.Builder'
import { MissingRequiredField, HasItems } from '../Common/Validation/HelperFunctions'
import { IsArray, IsObject } from '../Common/Validation/TypeChecks'
import { DEFAULT_AIL_VERSION, DEFAULT_OPEN_API_VERSION } from '../Config/Config'
import { AilFactoryException } from './Exceptions/Ail.Factory.Exception'
import { IAilJson, IOperationObjectCollection, NO_DESCRIPTION_PROVIDED } from './Interfaces/Ail.Interfaces'

// The headers should be filtered out if included with raw API data
const FILTERED_HEADERS = ['x-powered-by', 'etag', 'connection', 'user-agent']

/**
 * Used to create AIL JSON objects
 *
 * AIL JSON is an extended subset of OpenAPI 3.0.0
 */
export class AilFactory {
  private static readonly AIL_VERSION = DEFAULT_AIL_VERSION
  private static readonly OPEN_API_VERSION = DEFAULT_OPEN_API_VERSION

  /**
   * This class should never be instantiated
   */
  protected constructor() {}

  /**
   * Converts an array of API results into an AIL JSON object
   *
   * @param controller The name of the controller the results belong to
   * @param rawPaths Raw API documentation data for a controller's paths
   * @param options Values that may impact the AIL output such as tags for the operations
   */
  public static Create(controller: string, rawPaths: ContainerPaths, options: IOptionalContainerContents): IAilJson {
    const ailJson: IAilJson = {
      ailVersion: this.AIL_VERSION,
      dateCreated: Date.now(),
      openApiVersion: this.OPEN_API_VERSION,
      controller,
      paths: {}
    }

    const paths = rawPaths
      .map(([path, rawData]) => {
        this.ValidateRawData(path, rawData)
        return this.RawPathToAil(path, rawData, options)
      })
      .sort(([path1, _], [path2, __]) => path1.localeCompare(path2))

    for (const [path, item] of paths) {
      ailJson.paths[path] = item
    }

    return ailJson
  }

  /**
   * Convert the raw path data into an AIL Paths Object
   *
   * @param path The name of the path
   * @param rawData Raw data associated with the path and its operations
   * @param options Values that may impact the AIL output such as tags for the operations
   */
  protected static RawPathToAil(
    path: string,
    rawData: RawDocData[],
    options: IOptionalContainerContents
  ): [string, PathItemObject] {
    const pathAilItem: PathItemObject = {
      ...this.RawOperationsToAil(rawData, options)
    }

    const pathAil: [string, PathItemObject] = [path, pathAilItem]

    return pathAil
  }

  /**
   * Convert the raw path operations into an object with keys containing OperationObjects
   *
   * @param rawData Raw data associated with the path and its operations
   * @param options Values that may impact the AIL output such as tags for the operations
   */
  protected static RawOperationsToAil(
    rawData: RawDocData[],
    options: IOptionalContainerContents
  ): IOperationObjectCollection {
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
        responses: {
          [value.results.res.status]: this.ResponseObjectFromRawData(value)
        }
      }

      if (options) {
        if (options.tags) {
          operationType.tags = options.tags
        }
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

    const schema: SchemaObject = { type: 'string' }

    const requestHeaders = rawData.requestHeaders
      ? this.ParseRawHeaders(rawData.results.req.headers, rawData.requestHeaders)
      : this.ParseRawHeaders(rawData.results.req.headers)

    for (const requestParameter of requestHeaders) {
      parameters.push(requestParameter)
    }

    if (rawData.parameters!.pathParameters) {
      for (const pathParam of rawData.parameters!.pathParameters) {
        parameters.push({ name: pathParam, in: 'path', schema, required: true })
      }
    }

    if (rawData.parameters!.queryParameters) {
      const queryParams = rawData.parameters!.queryParameters as QueryStringConfig
      if (IsQueryPairArray(queryParams)) {
        for (const queryParam of queryParams) {
          const exampleValue = BuildQueryString(queryParam)
          parameters.push({ name: queryParam.key, in: 'query', schema, example: exampleValue })
        }
      } else {
        const exampleValue = BuildQueryString(queryParams)
        parameters.push({ name: queryParams.key, in: 'query', schema, example: exampleValue })
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
            required: true
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
    headerDetails?: { [name: string]: IRawHeader }
  ): ParameterObject[] {
    const formattedHeaders: ParameterObject[] = Object.keys(headers)
      .filter(header => !FILTERED_HEADERS.includes(header))
      .map(header => {
        const exampleValue = SimpleParameterString(headers[header])
        const schema: SchemaObject = { type: 'string' }

        if (headerDetails && headerDetails[header]) {
          const { value, ...options } = headerDetails[header]
          return {
            name: header,
            in: 'header' as ParameterLocation,
            schema,
            example: exampleValue,
            ...options
          }
        }

        return {
          name: header,
          in: 'header' as ParameterLocation,
          schema,
          example: exampleValue
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
    if (IsObject(example)) {
      return { 'application/json': { example: { ...example } } }
    } else if (IsArray(example)) {
      return { 'application/json': { example: [...example] } }
    }

    return { 'application/json': example }
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
