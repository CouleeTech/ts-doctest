export type HttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export enum HttpRequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface IHttpRequestHeader {
  name: string
  value: any
}
