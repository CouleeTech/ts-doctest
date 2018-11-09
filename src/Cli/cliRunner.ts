import { spawn } from 'child_process'

import { GetFullPath, VerifyFileExists } from '../Common/Util/FileUtils'

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
   * Output format.
   */
  format?: string
}

export const enum Status {
  Ok = 0,
  FatalError = 1,
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
  VerifyFileExists(
    doctestConfigPath,
    `Invalid path for the doctest configuration file. File not found: ${doctestConfigPath}`,
  )

  if (options.jestConfig) {
    const jestConfigPath = GetFullPath(options.jestConfig)
    VerifyFileExists(jestConfigPath, `Invalid path for the jest configuration file. File not found: ${jestConfigPath}`)
    await runTests(logger, jestConfigPath)
  } else {
    await runTests(logger)
  }

  return Status.Ok
}

async function runTests(logger: ILogger, jestConfigPath?: string) {
  const nodeModules = GetFullPath('node_modules')
  const jestPath = `${nodeModules}/jest/bin/jest.js`
  VerifyFileExists(jestPath, `Jest is required to run ts-doctest. Jest was not found at the expected path: ${jestPath}`)

  const command = jestConfigPath ? `${jestPath} -c ${jestConfigPath}` : `${jestPath}`

  const runner = spawn(command, {
    stdio: 'inherit',
    shell: true,
  } as any)

  let results: any
  const stdout: string[] = []

  runner.on('message', data => {
    results = data
  })

  runner.on('exit', code => {
    if (code !== 0) {
      throw new FatalError(`Testing Failed.`)
    } else {
      logger.log('Testing Complete. Generating Documentation.\n')
      return { results, stdout: stdout.join('') }
    }
  })
}
