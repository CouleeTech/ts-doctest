import { ContainerPaths } from '../Common/RawDocs.Container'
import { IHttpRequestHeader, HttpRequestMethod } from '../Common/Http.Types'

export interface IAilJson {
  version: number
  controller: string
  paths: ContainerPaths
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
  private static readonly AIL_VERSION = 0.1

  /**
   * This class should never be instantiated
   */
  private constructor() {}

  /**
   * Converts an array of API results into an AIL JSON object
   *
   * @param controller The name of the controller the results belong to
   * @param paths Raw API documentation data for a controller's paths
   */
  public static Create(controller: string, paths: ContainerPaths): IAilJson {
    const ailJson: IAilJson = { version: this.AIL_VERSION, controller, paths }
    console.log(JSON.stringify(paths))
    return ailJson
  }
}
