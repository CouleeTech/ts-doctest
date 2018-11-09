export type HttpRequestMethod =
  | 'GET'
  | 'get'
  | 'POST'
  | 'post'
  | 'PUT'
  | 'put'
  | 'DELETE'
  | 'delete'
  | 'TRACE'
  | 'trace'
  | 'OPTIONS'
  | 'options'
  | 'CONNECT'
  | 'connect'
  | 'HEAD'
  | 'head'

export const HTTP_METHODS_WITHOUT_BODY = ['HEAD', 'GET', 'DELETE', 'TRACE', 'CONNECT']

export enum HttpRequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface IHttpRequestHeader {
  name: string
  value: any
}

/**
 * Ensure that an HTTP method can include a request body
 *
 * @param method The HTTP method being checked
 */
export function HttpMethodWithRequestBody(method: HttpRequestMethod) {
  return !HTTP_METHODS_WITHOUT_BODY.includes(method.toUpperCase())
}
