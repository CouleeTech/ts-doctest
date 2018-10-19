import { OperationObject, PathsObject, PathItemObject } from 'openapi3-ts'

import { ContainerPaths } from '../Common/RawDocs.Container'
import { RawDocData } from '../Common/RawDocs.Interface'
import { IAilJson, IOperationObjectCollection } from './Interfaces/Ail.Factory.Interfaces'

/**
 * Used to create AIL JSON objects
 */
export class AilFactory {
  private static readonly AIL_VERSION = '0.1.0'
  private static readonly OPEN_API_VERSION = '3.0.0'

  /**
   * This class should never be instantiated
   */
  protected constructor() {}

  /**
   * Converts an array of API results into an AIL JSON object
   *
   * @param controller The name of the controller the results belong to
   * @param rawPaths Raw API documentation data for a controller's paths
   */
  public static Create(controller: string, rawPaths: ContainerPaths): IAilJson {
    const ailJson: IAilJson = {
      ailVersion: this.AIL_VERSION,
      dateCreated: Date.now(),
      openApiVersion: this.OPEN_API_VERSION,
      controller,
      paths: rawPaths.map(([path, rawData]) => this.RawPathToAil(path, rawData)),
    }
    // console.log(JSON.stringify(paths))
    return ailJson
  }

  /**
   * Convert the raw path data into an AIL Paths Object
   *
   * @param path The name of the path
   * @param rawData Raw data associated with the path and its operations
   */
  protected static RawPathToAil(path: string, rawData: RawDocData[]): PathsObject {
    const pathAilItem: PathItemObject = {
      ...this.RawOperationsToAil(rawData),
    }

    const pathAil: PathsObject = {
      [path]: pathAilItem,
    }

    return pathAil
  }

  /**
   * Convert the raw path operations into an object with keys containing OperationObjects
   *
   * If multiple operations of the same HTTP verb are included in one path, the first occurrence's
   * meta data will take precedence over all remaining occurrences. This includes properties except
   * for responses.
   *
   * @param rawData Raw data associated with the path and its operations
   */
  protected static RawOperationsToAil(rawData: RawDocData[]): IOperationObjectCollection {
    const operations: IOperationObjectCollection = {}

    for (const value of rawData) {
      const type = value.results!.req.method.toLowerCase()

      if (!operations[type]) {
        const operationObjectArray: OperationObject[] = []
        operations[type] = operationObjectArray
      }

      const operationType: OperationObject = {
        responses: [],
      }

      operations[type].push(operationType)
    }

    return operations
  }
}
