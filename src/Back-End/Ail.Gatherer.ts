import { IDoctestConfig, AilStorageEngineType, DEFAULT_AIL_VERSION, DEFAULT_OPEN_API_VERSION } from '../Config/Config'
import { GetDirectoryContents, GetJsonFile } from '../Common/Util/FileUtils'
import { IsString } from '../Common/Validation/TypeChecks'
import { IAilCollection, IAilJson, IAilCollectionItem } from './Interfaces/Ail.Interfaces'

export class AilGathererException extends Error {
  public constructor(message: string) {
    super(message)
  }
}

/**
 * After all test suites have ran, this class will be used to get all of the AIL results
 *
 * When invoked, the AIL Gatherer combines all of the AIL results into one in-memory object
 */
export class AilGatherer {
  /**
   * Combine all AIL results into one collection
   *
   * @param config A doctest configuration object
   */
  public static async Gather(config: IDoctestConfig): Promise<IAilCollection> {
    let ailResults: IAilJson[] = []
    switch (config.storageEngine) {
      case AilStorageEngineType.FILE:
        ailResults = await this.GatherFromFilesystem(config.resultsDirectory)
        break
      default:
        throw new AilGathererException(`${config.storageEngine} is not valid storage engine type`)
    }

    if (ailResults.length < 1) {
      throw new AilGathererException('No AIL results were found')
    }

    return this.BuildAilCollection(config, ailResults)
  }

  /**
   * Validates and combines independent AIL results
   *
   * @param ailResults An array of independent AIL results
   */
  private static BuildAilCollection(config: IDoctestConfig, ailResults: IAilJson[]): IAilCollection {
    const ailVersion = config.ailVersion ? config.ailVersion : DEFAULT_AIL_VERSION
    const openApiVersion = config.openApiVersion ? config.openApiVersion : DEFAULT_OPEN_API_VERSION

    const collection: IAilCollection = {
      ailVersion,
      openApiVersion,
      dateCreated: Date.now(),
      items: {}
    }

    const items: Array<[string, IAilCollectionItem]> = []
    for (const result of ailResults) {
      this.ValidateAilResult(result, ailVersion, openApiVersion)
      const item: IAilCollectionItem = { dateCreated: result.dateCreated, paths: result.paths }
      items.push([result.controller, item])
    }

    const controllersEncountered: Set<string> = new Set<string>()
    const sortedItems = items.sort(([item1, _], [item2, __]) => item1.localeCompare(item2))
    for (const [controller, item] of sortedItems) {
      if (controllersEncountered.has(controller)) {
        throw new AilGathererException(`Encountered duplicate controller: ${controller}`)
      }
      controllersEncountered.add(controller)
      collection.items[controller] = item
    }

    return collection
  }

  /**
   * Read the AIL JSON from each file in the AIL results directory
   *
   * @param resultsDirectory The directory that contains all of the AIL files
   */
  private static async GatherFromFilesystem(resultsDirectory: string): Promise<IAilJson[]> {
    const resultsFileList = (await GetDirectoryContents(resultsDirectory)).filter(file => file.endsWith('.ail.json'))

    if (!resultsFileList || resultsFileList.length < 1) {
      throw new AilGathererException('No AIL results were found')
    }

    const ailResults = Promise.all(
      resultsFileList.map(async resultsFile => await GetJsonFile<IAilJson>(`${resultsDirectory}/${resultsFile}`))
    )

    return ailResults
  }

  private static async ValidateAilResult(ailResult: IAilJson, ailVersion: string, openApiVersion: string) {
    if (!ailResult.hasOwnProperty('controller') || !IsString(ailResult.controller)) {
      throw new AilGathererException(
        'Encountered an AIL result with no controller name or an invalid value for the controller name.'
      )
    }

    const name = ailResult.controller

    if (!ailResult.hasOwnProperty('ailVersion')) {
      InvalidAilResult(name, 'has no AIL version')
    }

    if (!ailResult.hasOwnProperty('openApiVersion')) {
      InvalidAilResult(name, 'has no OpenAPI version')
    }

    if (!ailResult.hasOwnProperty('paths')) {
      InvalidAilResult(name, 'has no OpenAPI version')
    }

    if (ailResult.ailVersion !== ailVersion) {
      InvalidAilResult(name, `has an incompatible AIL version of ${ailResult.ailVersion}. ${ailVersion} was expected`)
    }

    if (ailResult.openApiVersion !== openApiVersion) {
      InvalidAilResult(
        name,
        `has an incompatible OpenAPI version of ${ailResult.openApiVersion}. ${openApiVersion} was expected`
      )
    }

    const pathKeys = Object.keys(ailResult.paths)

    if (pathKeys.length < 1) {
      InvalidAilResult(name, 'has no path results')
    }
  }
}

/* ~~~ Helper Functions ~~~ */

function InvalidAilResult(name: string, message: string) {
  throw new AilGathererException(`The ${name} AIL result ${message}.`)
}
