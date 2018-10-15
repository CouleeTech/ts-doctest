import { ITestSuiteInfo } from '../Front-End/ControllerTestSuite'
import { RawDocData } from './RawDocs.Interface'

export type Title = string

export type ContainerPaths = Array<[string, RawDocData[]]>

export interface IContainerContents {
  controller: string
  description: string
  paths: ContainerPaths
}

/**
 * Used to hold a controller's raw API documentation data
 */
export class RawDocContainer {
  private readonly controller: string
  private readonly description?: string
  private data: Map<string, Set<RawDocData>>
  private consumed: boolean

  /**
   * @param controller The name of the controller the documentation belongs to
   */
  public constructor(info: ITestSuiteInfo) {
    this.consumed = false
    this.controller = info.controller
    if (info.description) {
      this.description = info.description
    }
    this.data = new Map<string, Set<RawDocData>>()
  }

  /**
   * Store the documentation data from an operation on one of the controller's paths
   *
   * @param data An API operation's raw documentation data
   */
  public save(data: RawDocData) {
    if (this.consumed) {
      throw new Error('Tried to add a result to a consumed container.')
    }

    const pathResults = this.data.get(data.path as string)

    if (pathResults) {
      pathResults.add(data)
    } else {
      const newResultsSet: Set<RawDocData> = new Set<RawDocData>()
      newResultsSet.add(data)
      this.data.set(data.path as string, newResultsSet)
    }
  }

  /**
   * Release all of controller's raw API data from the container
   *
   * Calling this method prevents any further interaction with an instance
   */
  public consume(): IContainerContents {
    if (this.consumed) {
      throw new Error('Tried to consume a container that has already been consumed.')
    }

    this.consumed = true
    return {
      controller: this.controller,
      description: this.description || '',
      paths: Array.from(this.data, ([path, data]) => [path, [...data.values()]]) as ContainerPaths,
    }
  }
}
