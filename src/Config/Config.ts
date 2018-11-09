export const DEFAULT_CONFIG_PATH = 'doctest.json'

/**
 * The storage engine used for AIL objects
 */
export enum AilStorageEngineType {
  FILE = 'FILE',
  MEMORY = 'MEMORY'
}

/**
 * The data structure for the doctest configuration
 */
export interface IDoctestConfig {
  storageEngine: AilStorageEngineType
  resultsDirectory: string
}
