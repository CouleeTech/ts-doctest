export const DEFAULT_CONFIG_PATH = 'doctest.json'
export const DEFAULT_AIL_VERSION = '0.1.0'
export const DEFAULT_OPEN_API_VERSION = '3.0.0'

/**
 * The storage engine used for AIL objects
 */
export enum AilStorageEngineType {
  FILE = 'FILE',
  MEMORY = 'MEMORY'
}

/**
 * Various formats that an AIL JSON collection may be converted to
 */
export enum OutputFormat {
  SWAGGER = 'swagger',
  SPHINX = 'sphinx'
}

/**
 * The data structure for the doctest configuration
 */
export interface IDoctestConfig {
  storageEngine: AilStorageEngineType
  resultsDirectory: string

  /**
   * Include a path to an application to fork before running tests
   */
  appPath?: string
  ailVersion?: string
  openApiVersion?: string
  outputFormats: OutputFormat[]
}
