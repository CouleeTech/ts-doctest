import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export interface IOptions {
  /**
   * Path to a configuration file.
   */
  config?: string

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

    // Fix prototype chain for target ES5
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
  if (!options.config) {
    throw new FatalError(`ts-doctest requires a valid configration`)
  }

  const invokerPath = path.resolve('.')
  const configPath = `${invokerPath}/${options.config}`

  if (!fs.existsSync(configPath)) {
    throw new FatalError(`Invalid option for configuration. File not found: ${configPath}`)
  }

  await runTests(configPath)
  logger.log('Testing Complete. Generating Documentation.\n')

  return Status.Ok
}

async function runTests(configPath: string) {
  const invokerPath = path.resolve('.')
  const nodeModules = `${invokerPath}/node_modules`
  const jestPath = `${nodeModules}/jest/bin/jest.js`

  const runner = spawn(`${jestPath} --config=${configPath}`, {
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
      throw new Error()
    } else {
      return { results, stdout: stdout.join('') }
    }
  })
}
