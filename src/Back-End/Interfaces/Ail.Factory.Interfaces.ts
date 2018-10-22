import { OperationObject, PathsObject, ResponseObject } from 'openapi3-ts'
import { IHttpRequestHeader, HttpRequestMethod } from '../../Common/Http'

export const pathOperations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

/* Constant Strings */

export const NO_DESCRIPTION_PROVIDED = 'No description provided'

export interface IOperationObjectCollection {
  [path: string]: OperationObject[]
}

export interface IOperationResponses {
  [response: string]: ResponseObject
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
