import * as fs from 'fs'

import { IsObject, IsString } from '../Common'
import { RawDocContainer } from '../Common/RawDocs.Container'

import { AilFactory, IAilJson } from './Ail.Factory'

/**
 * The storage engine used for AIL objects
 */
export enum AilStorageEngineType {
  FILE = 'FILE',
  MEMORY = 'MEMORY',
}

/**
 * A configuration object used to initialize the AilManager
 */
export interface IAilManagerConfig {
  storageEngine: AilStorageEngineType
  resultsDirectory?: string
}

/**
 * The primary interface to the back-end used to convert raw API doc data into AIL files
 *
 * Raw API documentation data is stored in formatted JSON files. These files are used
 * to generate intermediate files that can be converted to documentation.
 */
export class AilManager {
  private static ALLOWED_ENGINE_TYPES = ['FILE', 'MEMORY']
  private static API_RESULT_DIR = './test/Results'
  private static CONFIG: IAilManagerConfig | null = null
  private static DEFAULT_CONFIG_PATH = './doctest.json'
  private static INITIALIZED = false

  /**
   * This class should never be instantiated
   */
  private constructor() {}

  /**
   * Consumes an ApiResultContainer and writes its data into the results directory
   *
   * This method requires the AilManager to be configured before it is invoked.
   */
  public static async ConsumeContainer(container: RawDocContainer) {
    if (!this.INITIALIZED) {
      throw new Error('Tried to consume a container with an uninitialized AilManager')
    }

    const { controller, paths } = container.consume()
    this.CreateApiResultFile(controller)
    const ailJson: IAilJson = AilFactory.Create(controller, paths)
    await this.WriteApiResultFile(controller, ailJson)
  }

  /**
   * Initializes a new process' AilManager for converting raw API results to AIL format
   *
   * This will configure the storage engine for the AIL results. This will throw an error if
   * the AilManager has already been initialized in the active process.
   *
   * @param option The configuration used for initialization. If missing, a JSON cofig is required.
   *               This can also be a custom path for the config file.
   */
  public static Init(option?: IAilManagerConfig | string) {
    if (this.INITIALIZED) {
      throw new Error('The AilManager has already been initialized in this process')
    }
    this.INITIALIZED = true

    if (!option || IsString(option)) {
      const config = option ? this.GetConfigFromFilesystem(option as string) : this.GetConfigFromFilesystem()
      if (!config) {
        throw new Error(`No configuration was supplied and no ${this.DEFAULT_CONFIG_PATH} file could be found`)
      }
      this.CONFIG = config
    } else if (IsObject(option)) {
      this.CONFIG = option as IAilManagerConfig
    } else {
      throw new Error(`Supplied the Init method with a configuration the was neither a string nor an object`)
    }

    this.ValidateConfig()

    if (this.CONFIG.storageEngine === AilStorageEngineType.FILE) {
      this.EnsureApiResultsDirectory()
    }
  }

  /**
   * Creates a file that is used to save the API results of one controller
   *
   * @param controller The name of the controller the results belong to
   */
  private static CreateApiResultFile(controller: string) {
    fs.closeSync(fs.openSync(`${this.GetResultFilePath(controller)}`, 'w'))
  }

  /**
   * Creates a directory for the API results
   */
  private static CreateApiResultsDirectory() {
    console.log('Creating the API Test results directory')
    fs.mkdirSync(this.API_RESULT_DIR)
  }

  /**
   * Ensures that the API results directory exists. If not, it creates the directory.
   */
  private static EnsureApiResultsDirectory() {
    fs.stat(this.API_RESULT_DIR, (err, stats) => {
      if (err) {
        if (DoesNotExist(err)) {
          console.log('API Test results directory does not exist!')
          this.CreateApiResultsDirectory()
        } else {
          throw new Error('Unexpected error encountered while searching for the results directory')
        }
      } else {
        if (stats) {
          if (!stats.isDirectory()) {
            console.log('API Test results is not a directory. Deleting file.')
            fs.unlinkSync(this.API_RESULT_DIR)
            this.CreateApiResultsDirectory()
          }
        } else {
          throw new Error('Unexpected Error: No Stats')
        }
      }
    })
  }

  /**
   * Attempt to gather a config object form a JSON configuration file named doctest.json
   *
   * @param customPath An optional custom path to the configuration file
   */
  private static GetConfigFromFilesystem(customPath?: string): IAilManagerConfig | null {
    const configPath = customPath ? customPath : this.DEFAULT_CONFIG_PATH
    try {
      const stats = fs.statSync(configPath)

      if (!stats.isFile()) {
        return null
      }

      const rawConfig: string = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(rawConfig)
      return config
    } catch (e) {
      return null
    }
  }

  /**
   * Get the filesystem path for a particular controller's API result file
   *
   * @param controller The name of the controller the results belong to
   */
  private static GetResultFilePath(controller: string) {
    return `${this.API_RESULT_DIR}/${controller}.ail.json`
  }

  /**
   * Ensure that the configuration object is valid
   */
  private static ValidateConfig() {
    if (!this.CONFIG) {
      throw new Error('The AIL Manager config was null')
    }

    const { storageEngine } = this.CONFIG

    if (!this.ALLOWED_ENGINE_TYPES.includes(storageEngine)) {
      throw new Error(`${storageEngine} is not a valid storage engine for the AIL manager`)
    }
  }

  /**
   * Write an AIL JSON object to a controller's API result file
   *
   * @param controller The name of the controller the results belong to
   * @param ailJson The AIL JSON object
   */
  private static async WriteApiResultFile(controller: string, ailJson: IAilJson) {
    return await Promise.resolve(
      fs.writeFile(`${this.GetResultFilePath(controller)}`, `${JSON.stringify(ailJson)}\n`, err => {
        const resultFile = this.GetResultFilePath(controller)
        if (err) {
          throw new Error(`Failed the write the following Api result file: ${resultFile}`)
        }
        console.log(`Wrote the ${controller} controller's API results to the following file: ${resultFile}`)
      }),
    )
  }
}

// Helper Functions

function DoesNotExist(err: NodeJS.ErrnoException) {
  return err.code === 'ENOENT'
}
