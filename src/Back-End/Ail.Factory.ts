import { OperationObject, PathsObject, PathItemObject } from 'openapi3-ts'

import { ContainerPaths } from '../Common/RawDocs.Container'
import { RawDocData } from '../Common/RawDocs.Interface'
import { IHttpRequestHeader, HttpRequestMethod } from '../Common/Http.Types'

export const pathOperations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']
export interface IOperationObjectCollection {
  [path: string]: OperationObject
}

export interface IAilJson {
  ailVersion: string
  dateCreated: number
  openApiVersion: string
  controller: string
  paths: PathsObject[]
}

export interface IAilRequest {
  headers: IHttpRequestHeader[]
  body?: any
}

export interface IAilResponse {
  headers: IHttpRequestHeader[]
  body: any
  status: number
}

export interface IAilRoute {
  method: HttpRequestMethod
  route: string
  title: string
  request: IAilRequest
  response: IAilResponse
}

/**
 * Used to create AIL JSON objects
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
      paths: rawPaths.map(([path, rawData]) => this.RawPathToAil(path, rawData)),
    }
    // console.log(JSON.stringify(paths))
    return ailJson
  }

  protected static RawPathToAil(path: string, rawData: RawDocData[]): PathsObject {
    const pathAilItem: PathItemObject = {
      ...this.RawOperationsToAil(rawData),
    }

    const pathAil: PathsObject = {
      [path]: pathAilItem,
    }

    return pathAil
  }

  protected static RawOperationsToAil(rawData: RawDocData[]): IOperationObjectCollection {
    const operations: IOperationObjectCollection = {}

    for (const value of rawData) {
      const type = value.results!.req.method.toLowerCase()
      if (!operations[type]) {
        operations[type] = {
          description: 'tests',
          responses: [],
        }
      }
    }

    return operations
  }
}
