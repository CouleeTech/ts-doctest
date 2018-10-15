// Request Header
export interface IRequestHeaderOptions {
  description?: string
}

export interface IRequestHeader extends IRequestHeaderOptions {
  name: string
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
  name: string
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

// Results

export interface IResults {
  req: any
  res: any
}

export type RawDocData = Partial<{
  path: string
  requestBody: IRequestBody
  requestHeaders: IRequestHeader[]
  responseBody: IResponseBody
  responseHeaders: IResponseHeader[]
  responseStatus: IResponseStatus
  results: IResults
}>
