import { IsObject, IsString } from '../Common'
import { RawDocContainer } from '../Common/RawDocs.Container'
import { GetJsonFileSync, GetFullPath, WriteJsonFile, VerifyDirectoryExistsSync } from '../Common/Util/FileUtils'
import { AilStorageEngineType, DEFAULT_CONFIG_PATH } from '../Config/Config'
import { AilFactory } from './Ail.Factory'
import { IAilJson } from './Interfaces/Ail.Interfaces'

/**
 * A configuration object used to initialize the AilManager
 */
export interface IAilManagerConfig {
  storageEngine: AilStorageEngineType
  resultsDirectory?: string
}

/**
 * Used to convert raw API doc data into AIL files
 *
 * Raw API documentation data is stored in formatted JSON files. These files are used
 * to generate intermediate files that can be converted to documentation.
 */
export class AilManager {
  private static ALLOWED_ENGINE_TYPES = [AilStorageEngineType.FILE, AilStorageEngineType.MEMORY]
  private static CONFIG: IAilManagerConfig
  private static INITIALIZED = false
  private static MEMORY_RESULTS: Map<string, IAilJson>

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

    const ailJson: IAilJson = AilFactory.Create(controller, paths)
    await this.StoreAilResults(controller, ailJson)
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
        throw new Error(`No configuration was supplied and no ${DEFAULT_CONFIG_PATH} file could be found`)
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
    } else if (this.CONFIG.storageEngine === AilStorageEngineType.MEMORY) {
      this.MEMORY_RESULTS = new Map<string, IAilJson>()
    }
  }

  /**
   * Ensures that the API results directory exists. If not, it creates the directory.
   */
  private static EnsureApiResultsDirectory() {
    VerifyDirectoryExistsSync(this.CONFIG.resultsDirectory as string)
  }

  /**
   * Attempt to gather a config object form a JSON configuration file named doctest.json
   *
   * @param customPath An optional custom path to the configuration file
   */
  private static GetConfigFromFilesystem(customPath?: string): IAilManagerConfig | null {
    const configPath = customPath ? customPath : GetFullPath(DEFAULT_CONFIG_PATH)
    return GetJsonFileSync(configPath)
  }

  /**
   * Get the filesystem path for a particular controller's API result file
   *
   * @param controller The name of the controller the results belong to
   */
  private static GetResultFilePath(controller: string) {
    return `${this.CONFIG.resultsDirectory as string}/${controller}.ail.json`
  }

  /**
   * Store the AIL object depending on the configured storage engine
   *
   * @param controller The name of the controller the results belong to
   * @param ailJson The AIL JSON object
   */
  private static StoreAilResults(controller: string, ailJson: IAilJson) {
    const { storageEngine } = this.CONFIG as IAilManagerConfig

    switch (storageEngine) {
      case AilStorageEngineType.FILE:
        this.WriteApiResultFile(controller, ailJson)
        break
      case AilStorageEngineType.MEMORY:
        this.MEMORY_RESULTS.set(controller, ailJson)
        break
    }
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
    const { storageEngine } = this.CONFIG as IAilManagerConfig

    if (storageEngine === AilStorageEngineType.FILE) {
      const filePath = this.GetResultFilePath(controller)
      try {
        await WriteJsonFile(filePath, ailJson)
      } catch (e) {
        throw new Error(`Failed the write the following intermediate file: ${filePath}`)
      }
    }
  }
}
