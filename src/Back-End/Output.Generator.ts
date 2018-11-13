import { OpenAPIObject, PathsObject } from 'openapi3-ts'

import { GetFullPath, WriteJsonFile } from '../Common/Util/FileUtils'
import { IDoctestConfig, OutputFormat } from '../Config/Config'
import { IAilCollection } from './Interfaces/Ail.Interfaces'

const PATH_ITEM_OBJECT_VERBS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

/**
 * Generates ouput based on the provided doctest configuration
 */
export class OutputGenerator {
  public static async GenerateOutput(
    { resultsDirectory, outputFormats }: IDoctestConfig,
    ailCollection: IAilCollection
  ) {
    for (const format of outputFormats) {
      await this.GenerateOutputFormat(format, resultsDirectory, ailCollection)
    }
  }

  private static async GenerateOutputFormat(
    format: OutputFormat,
    resultsDirectory: string,
    ailCollection: IAilCollection
  ) {
    switch (format) {
      case OutputFormat.SWAGGER:
        await this.GenerateSwaggerOutput(resultsDirectory, ailCollection)
    }
  }

  private static async GenerateSwaggerOutput(resultsDirectory: string, ailCollection: IAilCollection) {
    const fullResultPath = `${GetFullPath(resultsDirectory)}/swagger.json`

    const openApiJson: OpenAPIObject = {
      openapi: ailCollection.openApiVersion,
      info: {
        title: 'test title',
        description: 'test description',
        license: {
          name: 'UNLICENSED'
        },
        version: '1.0.0'
      },
      paths: this.AilCollectionToSwaggerPaths(ailCollection)
    }

    await WriteJsonFile(fullResultPath, openApiJson)
  }

  /**
   * Convery an AIL collection into an OpenApi Paths Object
   *
   * Duplicate paths will be excluded from the result of this method.
   * Also, only one Operation Object is allowed for each Path Item Object HTTP verb.
   */
  private static AilCollectionToSwaggerPaths({ items }: IAilCollection): PathsObject {
    const pathsEncountered: Set<string> = new Set<string>()
    const pathsObject: PathsObject = {}

    for (const item of Object.keys(items)) {
      const { paths } = items[item]

      for (const path of Object.keys(paths)) {
        if (pathsEncountered.has(item)) {
          continue
        }

        pathsEncountered.add(path)
        const pathItemObject = paths[path]

        for (const verb of PATH_ITEM_OBJECT_VERBS) {
          if (pathItemObject.hasOwnProperty(verb)) {
            pathItemObject[verb] = pathItemObject[verb].shift()
          }
        }

        pathsObject[path] = pathItemObject
      }
    }

    return pathsObject
  }
}
