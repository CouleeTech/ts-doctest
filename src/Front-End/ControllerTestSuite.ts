import { Response } from 'superagent'
import * as supertest from 'supertest'

import { HttpRequestMethod, HttpRequestMethods } from '../Common/Http'
import { RawDocContainer } from '../Common/RawDocs.Container'
import { RawDocData, IRequestParameters } from '../Common/RawDocs.Interface'
import { IsFunction, IsString } from '../Common/Validation/TypeChecks'

import { AilManager } from '../Back-End/Ail.Manager'
import { QueryStringConfig, BuildQueryString } from '../Common/Util/QueryString.Builder'
import { IApplication } from './Application.Interface'
import { RequestWrapper } from './Request.Wrapper'
import { TestSuiteException } from './TestSuite.Exception'

export interface ITestSuiteInfo {
  controller: string
  description?: string
  tags?: string[]
}

export interface ITestSuiteConfig {
  appBuilder: () => Promise<IApplication>
  info: ITestSuiteInfo
}

export interface IPathConfig {
  name: string
  description?: string
  templates?: string[]
}

export type OperationTemplates = Record<string, any>

export interface IOperationConfig {
  name: string
  description?: string
  query?: QueryStringConfig
  templates?: OperationTemplates
}

/**
 * The primary interface for the creating api test suites used for testing and documenting API endpoints
 *
 * Each test suite should represent one and only one controller. Also, in regards to documentation, there should
 * only ever be one test suite per controller. Use this class by extending it and implementing its abstract methods.
 * To initiate the test suite create a trigger function using the `build` method.
 */
export abstract class ControllerTestSuite {
  private app: IApplication | string
  private appBuilder: () => Promise<IApplication | string>
  private controller: string
  private paths: Map<string, TestSuitePath>
  private resultContainer: RawDocContainer
  private requestWrappers: Set<RequestWrapper>

  /**
   * @param config Requires a TestSuiteConfig
   */
  public constructor(config: ITestSuiteConfig) {
    this.setAppBuilder(config.appBuilder)
    this.controller = config.info.controller
    this.paths = new Map<string, TestSuitePath>()
    this.resultContainer = new RawDocContainer(config.info)
    this.requestWrappers = new Set<RequestWrapper>()
  }

  // ~~~ Public :: Lifecycle Methods ~~~ //

  /**
   * This is used similar to the way that afterAll is in Jest. However,
   * instead of passing the implementation as a function argument, this method must
   * be overriden with a body containing the implementation.
   */
  public abstract async afterAll(): Promise<void>

  /**
   * This is used similar to the way that beforeAll is in Jest. However,
   * instead of passing the implementation as a function argument, this method must
   * be overriden with a body containing the implementation.
   */
  public abstract async beforeAll(): Promise<void>

  // ~~~ Public :: Test Suite Building Methods ~~~ //

  /**
   * Takes care of building the actual Jest test suite
   */
  public build() {
    if (!this.appBuilder) {
      throw new Error(`The ${this.controller} ControllerTestSuite is missing an app builder function.`)
    }

    return () =>
      describe(this.controller, async () => {
        beforeAll(async () => {
          this.app = await this.appBuilder()
          AilManager.Init()
          await this.beforeAll()

          if (!IsString(this.app)) {
            await this.app.init()
          }
        })

        for (const path of this.paths.values()) {
          const tests = path.initialize()

          for (const [method, name, { config, generator }] of tests) {
            it(name, async () => {
              const req = await supertest(this.httpServer)
              let templatedPathName: string = path.name

              if (path.templates) {
                if (!config.templates) {
                  throw new Error(`The ${name} operation on the ${path.name} path provided no template values.`)
                }

                templatedPathName = ControllerTestSuite.FillPathStringWithTemplates(
                  path.name,
                  path.templates,
                  config.templates
                )
              }

              const pathName = config.query
                ? `${templatedPathName}${BuildQueryString(config.query)}`
                : templatedPathName

              let reqTestObject = null
              switch (method) {
                case HttpRequestMethods.GET:
                  reqTestObject = req.get(pathName)
                  break
                case HttpRequestMethods.POST:
                  reqTestObject = req.post(pathName)
                  break
                case HttpRequestMethods.PUT:
                  reqTestObject = req.put(pathName)
                  break
                case HttpRequestMethods.DELETE:
                  reqTestObject = req.delete(pathName)
                  break
              }

              if (!reqTestObject) {
                throw new Error(
                  `Failed to create a request test object for the ${name} operation on the ${path.name} path`
                )
              }

              // TODO : Clean up this section of code...
              const requestWrapperParams: IRequestParameters = {}
              if (config.query) requestWrapperParams.queryParameters = config.query
              if (path.templates) requestWrapperParams.pathParameters = path.templates

              const reqWrapper: RequestWrapper =
                config.query || path.templates
                  ? new RequestWrapper(path.name, reqTestObject, requestWrapperParams)
                  : new RequestWrapper(path.name, reqTestObject)

              this.requestWrappers.add(reqWrapper)
              await generator(reqWrapper)()
            })
          }
        }

        afterAll(async () => {
          await this.afterAll()

          if (!IsString(this.app)) {
            await this.app.close()
          }

          for (const reqWrapper of this.requestWrappers.values()) {
            const rawDocs: RawDocData = reqWrapper.exportRequestDocs()
            this.resultContainer.save(rawDocs)
          }

          await AilManager.ConsumeContainer(this.resultContainer)
        })
      })
  }

  /**
   * Begin building a new TestSuitePath
   *
   * @param config The configuration object for a TestSuitePath
   */
  public path(config: IPathConfig | string): TestSuitePath {
    if (IsString(config)) {
      config = { name: config }
    }

    const pathTemplates = ControllerTestSuite.CheckForPathTemplates(config.name)
    if (pathTemplates) {
      config.templates = pathTemplates
    }

    const testSuitePath = new TestSuitePath(config)
    this.paths.set(config.name, testSuitePath)
    return testSuitePath
  }

  //  ~~~ Private :: Application Methods ~~~ //

  /**
   * Set the app object. This should only ever be called in the constructor.
   *
   * @param app An instance of an IApplication
   */
  private setAppBuilder(appBuilder: () => Promise<IApplication>) {
    if (this.app) {
      throw new Error(
        `Tried to add an app object to the ${this.controller} ControllerTestSuite when it already has one.`
      )
    }
    this.appBuilder = appBuilder
  }

  /**
   * Get an httpServer from the app object
   */
  private get httpServer() {
    if (!this.app) {
      throw new Error(`Tried to access an httpServer on a ${this.controller} ControllerTestSuite with no app object.`)
    }

    return IsString(this.app) ? this.app : this.app.getHttpServer()
  }

  // ~~~ Private :: Helper Methods ~~~ //

  /**
   * Check for templates is the URI of a controller's path
   *
   * An example of a template would be {id}. There will be used as name variables that must be
   * set before each operation on the path.
   *
   * @param name: The name of the controller's path
   */
  protected static CheckForPathTemplates(name: string): string[] | null {
    return name.match(/((?<=\{)\w+(?=\}))/g)
  }

  protected static FillPathStringWithTemplates(
    pathName: string,
    pathTemplates: string[],
    operationTemplates: OperationTemplates
  ) {
    let templatedPathName = pathName

    for (const template of pathTemplates) {
      if (!operationTemplates[template]) {
        throw new Error(`The ${name} operation on the ${pathName} path is missing a template value for {${template}}.`)
      }
      templatedPathName = templatedPathName.replace(`{${template}}`, operationTemplates[template])
    }

    return templatedPathName
  }
}

export type ResponseGenerator = (req: any) => () => Promise<Response>

export interface IPathOperation {
  config: IOperationConfig
  generator: ResponseGenerator
}

export type TestSetContents = [HttpRequestMethod, string, IPathOperation]

export type TestSet = Set<TestSetContents>

/**
 * Holds the configuration and implmentations for each operation of a Controller's path
 */
export class TestSuitePath {
  private initialized: boolean
  private readonly config: IPathConfig
  private getOperations: Map<string, IPathOperation>
  private postOperations: Map<string, IPathOperation>
  private putOperations: Map<string, IPathOperation>
  private deleteOperations: Map<string, IPathOperation>

  public constructor(config: IPathConfig) {
    this.initialized = false
    this.config = config
    this.getOperations = new Map<string, IPathOperation>()
    this.postOperations = new Map<string, IPathOperation>()
    this.putOperations = new Map<string, IPathOperation>()
    this.deleteOperations = new Map<string, IPathOperation>()
  }

  // ~~~ Path Operation Building Methods ~~~ //

  public get(
    config: IOperationConfig | string,
    second: OperationTemplates | ResponseGenerator,
    third?: ResponseGenerator
  ) {
    return this.operation(HttpRequestMethods.GET, config, second, third)
  }

  public post(
    config: IOperationConfig | string,
    second: OperationTemplates | ResponseGenerator,
    third?: ResponseGenerator
  ) {
    return this.operation(HttpRequestMethods.POST, config, second, third)
  }

  public put(
    config: IOperationConfig | string,
    second: OperationTemplates | ResponseGenerator,
    third?: ResponseGenerator
  ) {
    return this.operation(HttpRequestMethods.PUT, config, second, third)
  }

  public delete(
    config: IOperationConfig | string,
    second: OperationTemplates | ResponseGenerator,
    third?: ResponseGenerator
  ) {
    return this.operation(HttpRequestMethods.DELETE, config, second, third)
  }

  public get templates() {
    return this.config.templates || false
  }

  /**
   * The path's name
   */
  public get name() {
    return this.config.name
  }

  // ~~~ Internal Use Only Methods ~~~ //

  // WARNING! The following methods should only ever be invoked within implementation blocks on the
  // ControllerTestSuite class. This excludes classes that inherit from ControllerTestSuite.

  /**
   * Mark the path as initialized and return each operation
   */
  public initialize(): TestSet {
    if (this.initialized) {
      throw new Error('Tried to initialize a test suite path that has already been initialized')
    }

    this.initialized = true
    const tests = new Set<TestSetContents>()

    for (const [name, operation] of this.getOperations) {
      tests.add([HttpRequestMethods.GET, name, operation])
    }
    for (const [name, operation] of this.postOperations) {
      tests.add([HttpRequestMethods.POST, name, operation])
    }
    for (const [name, operation] of this.putOperations) {
      tests.add([HttpRequestMethods.PUT, name, operation])
    }
    for (const [name, operation] of this.deleteOperations) {
      tests.add([HttpRequestMethods.DELETE, name, operation])
    }

    return tests
  }

  /**
   * Export the data generated from the path
   */
  public export() {
    if (!this.initialized) {
      throw new Error('Tried to export an uninitialized test suite path.')
    }
    return { description: this.config.description }
  }

  // ~~~ Private Methods ~~~ //

  private operation(
    type: HttpRequestMethods,
    config: IOperationConfig | string,
    second: OperationTemplates | ResponseGenerator,
    third?: ResponseGenerator
  ) {
    if (IsString(config)) {
      config = { name: config }
    }

    const operationSet = this.getOperationSet(type)

    if (IsFunction(second)) {
      operationSet.set(config.name, { config, generator: second as ResponseGenerator })
    } else if (third && IsFunction(third)) {
      config.templates = second
      operationSet.set(config.name, { config, generator: third })
    } else {
      throw new Error('Missing a valid response generator function.')
    }

    return this
  }

  private getOperationSet(type: HttpRequestMethods): Map<string, IPathOperation> {
    switch (type) {
      case HttpRequestMethods.POST:
        return this.postOperations
      case HttpRequestMethods.GET:
        return this.getOperations
      case HttpRequestMethods.PUT:
        return this.putOperations
      case HttpRequestMethods.DELETE:
        return this.deleteOperations
      default:
        throw new TestSuiteException(`The HTTP ${type} is not yet supported as a test suite operation.`)
    }
  }
}
