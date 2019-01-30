import { spawn, fork, ChildProcess } from 'child_process'

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

let testsAreAbleToRun = true
let sideApp: ChildProcess | null = null

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

  if (doctestConfig.appPath) startSideApplication(doctestConfig.appPath)

  const noCache = options.noCache ? options.noCache : false

  let jestConfigPath

  if (options.jestConfig) {
    jestConfigPath = GetFullPath(options.jestConfig)
    VerifyFileExistsSync(
      jestConfigPath,
      `Invalid path for the jest configuration file. File not found: ${jestConfigPath}`
    )
  }

  const startTime = Date.now()

  while (!testsAreAbleToRun) {
    await timer(500)
    const currentTime = Date.now()
    console.log(`Waiting to run tests.. ${(currentTime - startTime) / 1000} seconds`)
  }

  await runTests(logger, doctestConfig, noCache, jestConfigPath)
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
      if (sideApp) {
        sideApp.kill('SIGINT')
      }
      throw new FatalError(`Testing Failed.`)
    } else {
      if (sideApp) {
        sideApp.kill('SIGINT')
      }

      logger.log('Testing Complete. Generating Documentation.\n')
      const collection: IAilCollection = await AilGatherer.Gather(doctestConfig)
      await OutputGenerator.GenerateOutput(doctestConfig, collection)
      return { results, stdout: stdout.join('') }
    }
  })
}

function startSideApplication(path: string) {
  testsAreAbleToRun = false
  const fullPath = GetFullPath(path)
  VerifyFileExistsSync(fullPath, `Could not find the following side application: ${fullPath}`)
  sideApp = fork(fullPath)
  sideApp.on('message', message => handleSideApplicationMessage(message))
}

function timer(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

function handleSideApplicationMessage(message: any) {
  if (message.type && message.type === 'BEGIN_TESTING') {
    testsAreAbleToRun = true
  }
}
