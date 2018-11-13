import { spawn } from 'child_process'

import { AilGatherer } from '../Back-End/Ail.Gatherer'
import { IAilCollection } from '../Back-End/Interfaces/Ail.Interfaces'
import { OutputGenerator } from '../Back-End/Output.Generator'
import { GetFullPath, VerifyFileExistsSync, GetJsonFile } from '../Common/Util/FileUtils'
import { IDoctestConfig } from '../Config/Config'

export interface IOptions {
  /**
   * Path to the doctest configuration file.
   */
  doctestConfig?: string

  /**
   * Path to the jest configuration file.
   */
  jestConfig?: string

  /**
   * Run jest without using its caching.
   */
  noCache?: boolean

  /**
   * Output format.
   */
  format?: string
}

export const enum Status {
  Ok = 0,
  FatalError = 1
}

export interface ILogger {
  log(message: string): void
  error(message: string): void
}

export class FatalError extends Error {
  public static NAME = 'FatalError'
  constructor(public message: string, public innerError?: Error) {
    super(message)
    this.name = FatalError.NAME
    Object.setPrototypeOf(this, FatalError.prototype)
  }
}

export async function run(options: IOptions, logger: ILogger): Promise<Status> {
  try {
    return await runWorker(options, logger)
  } catch (error) {
    if (error instanceof FatalError) {
      logger.error(`${error.message}\n`)
      return Status.FatalError
    }
    throw error
  }
}

async function runWorker(options: IOptions, logger: ILogger): Promise<Status> {
  const doctestConfigPath = options.doctestConfig ? GetFullPath(options.doctestConfig) : GetFullPath('doctest.json')
  VerifyFileExistsSync(
    doctestConfigPath,
    `Invalid path for the doctest configuration file. File not found: ${doctestConfigPath}`
  )

  const doctestConfig: IDoctestConfig = await GetJsonFile<IDoctestConfig>(doctestConfigPath)
  const noCache = options.noCache ? options.noCache : false

  if (options.jestConfig) {
    const jestConfigPath = GetFullPath(options.jestConfig)
    VerifyFileExistsSync(
      jestConfigPath,
      `Invalid path for the jest configuration file. File not found: ${jestConfigPath}`
    )
    await runTests(logger, doctestConfig, noCache, jestConfigPath)
  } else {
    await runTests(logger, doctestConfig, noCache)
  }

  return Status.Ok
}

async function runTests(logger: ILogger, doctestConfig: IDoctestConfig, noCache: boolean, jestConfigPath?: string) {
  const nodeModules = GetFullPath('node_modules')
  const jestPath = `${nodeModules}/jest/bin/jest.js`
  VerifyFileExistsSync(
    jestPath,
    `Jest is required to run ts-doctest. Jest was not found at the expected path: ${jestPath}`
  )

  const command = jestConfigPath
    ? `${jestPath} -c ${jestConfigPath}${noCache ? ' --no-cache' : ''}`
    : `${jestPath}${noCache ? ' --no-cache' : ''}`

  const runner = spawn(command, {
    stdio: 'inherit',
    shell: true
  } as any)

  let results: any
  const stdout: string[] = []

  runner.on('message', data => {
    results = data
  })

  runner.on('exit', async code => {
    if (code !== 0) {
      throw new FatalError(`Testing Failed.`)
    } else {
      logger.log('Testing Complete. Generating Documentation.\n')

      const collection: IAilCollection = await AilGatherer.Gather(doctestConfig)
      await OutputGenerator.GenerateOutput(doctestConfig, collection)
      return { results, stdout: stdout.join('') }
    }
  })
}
