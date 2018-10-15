import {
  IResponseBody,
  IRequestBody,
  IResponseHeader,
  IResponseStatus,
  IRequestHeader,
  IResults,
  IRequestHeaderOptions,
  IRequestBodyOptions,
  IResponseBodyOptions,
  IResponseHeaderOptions,
  IResponseStatusOptions,
  RawDocData,
} from '../Common/RawDocs.Interface'

export type DynamicParameter<T> = T | string

/**
 * Combines documentation functionality with the testing facilities provided by supertest's request object
 */
export class RequestWrapper {
  private readonly path: any
  private readonly request: any
  private requestBody?: IRequestBody
  private requestHeaders: Set<IRequestHeader>
  private responseBody?: IResponseBody
  private responseHeaders: Set<IResponseHeader>
  private responseStatus?: IResponseStatus
  private results?: IResults

  /**
   * @param path The path associated with this request
   * @param req A Test object provided by the supertest library
   */
  constructor(path: string, req: any) {
    this.path = path
    this.request = req
    req.expect((res: any) => (this.results = RequestWrapper.ParseRawResponse(res)))
    this.requestHeaders = new Set<IRequestHeader>()
    this.responseHeaders = new Set<IResponseHeader>()
  }

  /**
   * This should be the last method called after builing the request
   */
  public send() {
    return this.request
  }

  /**
   * Set a header to be used during the request
   *
   * @param name The name of the header
   * @param value The value of the header
   * @param options Additional configuration options
   */
  public setHeader(name: string, value: any, options?: DynamicParameter<IRequestHeaderOptions>) {
    if (options) {
      if (IsString(options)) {
        this.requestHeaders.add({ name, value, description: options as string })
      } else {
        this.requestHeaders.add({ name, value, ...(options as IRequestHeaderOptions) })
      }
    } else {
      this.requestHeaders.add({ name, value })
    }

    this.request.set(name, value)
    return this
  }

  /**
   * Set the body to be used during the request
   *
   * @param body A value that will be included in the request body
   * @param options Additional configuration options
   */
  public setBody(body: any, options?: DynamicParameter<IRequestBodyOptions>) {
    if (options) {
      if (IsString(options)) {
        this.requestBody = { data: body, description: options as string }
      } else {
        this.requestBody = { data: body, ...(options as IRequestBodyOptions) }
      }
    } else {
      this.requestBody = { data: body }
    }

    this.request.set(body as any)
    return this
  }

  /**
   * Ensure that the response contains a particular body
   *
   * @param body The expected body of the response
   * @param options Additional configuration options
   */
  public expectBody(body: any, options?: DynamicParameter<IResponseBodyOptions>) {
    if (options) {
      if (IsString(options)) {
        this.responseBody = { data: body, description: options as string }
      } else {
        this.responseBody = { data: body, ...(options as IResponseBodyOptions) }
      }
    } else {
      this.responseBody = { data: body }
    }

    this.request.expect(body)
    return this
  }

  /**
   * Ensure that the response contains a particular header
   *
   * @param name The name of the header
   * @param value The value of the header
   * @param options Additional configuration options
   */
  public expectHeader(name: string, value: any, options?: DynamicParameter<IResponseHeaderOptions>) {
    if (options) {
      if (IsString(options)) {
        this.responseHeaders.add({ name, value, description: options as string })
      } else {
        this.responseHeaders.add({ name, value, ...(options as IResponseHeaderOptions) })
      }
    } else {
      this.responseHeaders.add({ name, value })
    }

    this.request.expect(name, value)
    return this
  }

  /**
   * Ensure that the response contains a particular HTTP status code
   *
   * @param code an HTTP status code
   * @param options Additional configuration options
   */
  public expectStatus(code: number, options?: DynamicParameter<IResponseStatusOptions>) {
    if (options) {
      if (IsString(options)) {
        this.responseStatus = { code, description: options as string }
      } else {
        this.responseStatus = { code, ...(options as IResponseStatusOptions) }
      }
    } else {
      this.responseStatus = { code }
    }

    this.request.expect(code)
    return this
  }

  /**
   * Get all of the documentation data relating to request
   */
  public exportRequestDocs(): RawDocData {
    const docs: RawDocData = { path: this.path, results: this.results }

    if (this.requestHeaders.size > 0) {
      docs.requestHeaders = Array.from(this.requestHeaders)
    }

    if (this.responseHeaders.size > 0) {
      docs.responseHeaders = Array.from(this.responseHeaders)
    }

    if (this.requestBody) {
      docs.requestBody = this.requestBody
    }

    if (this.responseBody) {
      docs.responseBody = this.responseBody
    }

    if (this.responseStatus) {
      docs.responseStatus = this.responseStatus
    }

    return docs
  }

  /**
   * The response object returned from the supertest library is in a raw unweidly format.
   * This function ensures that the reponse object will be formatted in a way that is useful
   * for further processing.
   *
   * @param response The raw response object returned from the supertest library
   */
  private static ParseRawResponse(response: any) {
    // TODO : Add validation to check for errors in the response object
    const rawData = JSON.parse(JSON.stringify(response))
    const { text, req, header, ...everythingElse } = rawData
    const body = JSON.parse(text)
    const result = { req, res: { body, headers: header, ...everythingElse } }
    return result
  }
}

/**
 * Check to see if a value is a string
 *
 * @param value The value to be checked
 */
function IsString(value: any) {
  return typeof value === 'string' || value instanceof String
}
