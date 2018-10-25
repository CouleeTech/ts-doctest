import {
  IResponseBody,
  IRequestBody,
  IResponseStatus,
  IResults,
  IRawHeaderOptions,
  IRequestBodyOptions,
  IResponseBodyOptions,
  IResponseStatusOptions,
  RawDocData,
  IRequestParameters,
} from '../Common/RawDocs.Interface'
import { IsString } from '../Common/Validation/TypeChecks'

export type DynamicParameter<T> = T | string

export interface IHeaderStorage extends IRawHeaderOptions {
  name: string
  value: any
}

/**
 * Combines documentation functionality with the testing facilities provided by supertest's request object
 */
export class RequestWrapper {
  private readonly path: any
  private readonly request: any
  private parameters: IRequestParameters
  private requestBody?: IRequestBody
  private requestHeaders: Set<IHeaderStorage>
  private responseBody?: IResponseBody
  private responseHeaders: Set<IHeaderStorage>
  private responseStatus?: IResponseStatus
  private results: IResults

  /**
   * @param path The path associated with this request
   * @param req A Test object provided by the supertest library
   * @param params an optional set of query or path parameters associated with the request
   */
  constructor(path: string, req: any, params?: IRequestParameters) {
    this.path = path
    this.request = req

    if (params) {
      this.configureParameters(params)
    }

    req.expect((res: any) => (this.results = RequestWrapper.ParseRawResponse(res)))
    this.requestHeaders = new Set<IHeaderStorage>()
    this.responseHeaders = new Set<IHeaderStorage>()
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
  public setHeader(name: string, value: any, options?: DynamicParameter<IHeaderStorage>) {
    if (options) {
      if (IsString(options)) {
        this.requestHeaders.add({ name, value, description: options as string })
      } else {
        this.requestHeaders.add({ name, value, ...(options as IRawHeaderOptions) })
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

    this.request.send(body as any)
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
  public expectHeader(name: string, value: any, options?: DynamicParameter<IRawHeaderOptions>) {
    if (options) {
      if (IsString(options)) {
        this.responseHeaders.add({ name, value, description: options as string })
      } else {
        this.responseHeaders.add({ name, value, ...(options as IRawHeaderOptions) })
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

    if (this.parameters) {
      docs.parameters = this.parameters
    }

    if (this.requestHeaders.size > 0) {
      docs.requestHeaders = {}

      for (const reqHeader of this.requestHeaders.values()) {
        const { name, value, ...options } = reqHeader
        docs.requestHeaders[name] = { value, ...options }
      }
    }

    if (this.responseHeaders.size > 0) {
      docs.responseHeaders = {}

      for (const resHeader of this.responseHeaders.values()) {
        const { name, value, ...options } = resHeader
        docs.responseHeaders[name] = { value, ...options }
      }
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

  private configureParameters(parameters: IRequestParameters) {
    this.parameters = parameters
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
    // TODO : Add ways to parse response types other than JSON
    const rawData = JSON.parse(JSON.stringify(response))
    const { text, req, header, ...everythingElse } = rawData
    const body = JSON.parse(text)
    const result = { req, res: { body, headers: header, ...everythingElse } }
    return result
  }
}
