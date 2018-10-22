// Request Parameters

export interface IRequestParameters {
  queryParameters?: any
  pathParameters?: any
}

// Request Header
export interface IRequestHeaderOptions {
  description?: string
}

export interface IRequestHeader extends IRequestHeaderOptions {
  value: any
}

// Request Body
export interface IRequestBodyOptions {
  description?: string
}

export interface IRequestBody extends IRequestBodyOptions {
  data: any
}

// Response Header
export interface IResponseHeaderOptions {
  description?: string
}

export interface IResponseHeader extends IResponseHeaderOptions {
  value: any
}

// Response Body
export interface IResponseBodyOptions {
  description?: string
}

export interface IResponseBody extends IResponseBodyOptions {
  data: any
}

// Response Status
export interface IResponseStatusOptions {
  description?: string
}

export interface IResponseStatus extends IResponseStatusOptions {
  code: number
}

export interface IRequestHeaders {
  [name: string]: IRequestHeader
}

export interface IResponseHeaders {
  [name: string]: IResponseHeader
}

// Results

export interface IResults {
  req: any
  res: any
}

export type RawDocData = { path: string; results: IResults } & Partial<{
  parameters: IRequestParameters
  requestBody: IRequestBody
  requestHeaders: IRequestHeaders
  responseBody: IResponseBody
  responseHeaders: IResponseHeaders
  responseStatus: IResponseStatus
}>
