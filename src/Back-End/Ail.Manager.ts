import * as fs from 'fs'

import { RawDocContainer } from '../Common/RawDocs.Container'

import { AilFactory, IAilJson } from './Ail.Factory'

/**
 * The primary interface to the back-end used to convert raw API doc data into AIL files
 *
 * Raw API documentation data is stored in formatted JSON files. These files are used
 * to generate intermediate files that can be converted to documentation.
 */
export class AilManager {
  // TODO : Make this configurable
  private static readonly API_RESULT_DIR = './test/Results'

  /**
   * This class should never be instantiated
   */
  private constructor() {}

  /**
   * Consumes an ApiResultContainer and writes its data into the results directory
   */
  public static async ConsumeContainer(container: RawDocContainer) {
    const { controller, paths } = container.consume()
    this.CreateApiResultFile(controller)
    const ailJson: IAilJson = AilFactory.Create(controller, paths)
    await this.WriteApiResultFile(controller, ailJson)
  }

  /**
   * Ensures that the API results directory exists. If not, it creates the directory.
   */
  public static EnsureApiResultsDirectory() {
    fs.stat(this.API_RESULT_DIR, (err, stats) => {
      if (err) {
        if (DoesNotExist(err)) {
          console.log('API Test results directory does not exist!')
          this.CreateApiResultsDirectory()
        } else {
          throw new Error('Unexpected Error')
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

  /**
   * Get the filesystem path for a particular controller's API result file
   *
   * @param controller The name of the controller the results belong to
   */
  private static GetResultFilePath(controller: string) {
    return `${this.API_RESULT_DIR}/${controller}.ail.json`
  }
}

// Helper Functions

function DoesNotExist(err: NodeJS.ErrnoException) {
  return err.code === 'ENOENT'
}
