import * as fs from 'fs'

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
    return await runWorker(options /*logger*/)
  } catch (error) {
    if (error instanceof FatalError) {
      logger.error(`${error.message}\n`)
      return Status.FatalError
    }
    throw error
  }
}

async function runWorker(options: IOptions /*logger: ILogger*/): Promise<Status> {
  if (options.config && !fs.existsSync(options.config)) {
    throw new FatalError(`Invalid option for configuration: ${options.config}`)
  }

  // TODO : Make this function run ts-jest
  // const results = {} as any
  // const { output, errorCount } = await results
  // if (output && output.trim()) {
  //   logger.log(`${output}\n`)
  // }
  // return errorCount === 0 ? Status.Ok : Status.FatalError
  return Status.Ok
}
