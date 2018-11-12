import * as fs from 'graceful-fs'
import * as path from 'path'

import { IsString } from '../Validation/TypeChecks'

export class FileException extends Error {
  public constructor(message: string) {
    super(message)
  }
}

const BASE_PATH = path.resolve('.')

/**
 * Convery a relative path to a full system path
 *
 * @param filePath The relative path to a file
 */
export function GetFullPath(filePath: string) {
  if (!IsString(filePath)) {
    throw new FileException('Please provide a valid file path.')
  }

  let pathString = filePath.slice(0)
  const firstChar = pathString.charAt(0)
  const secondChar = pathString.charAt(1)

  if (firstChar === '.' && secondChar === '/') {
    pathString = pathString.substring(2)
  } else if (firstChar === '/') {
    pathString = pathString.substring(1)
  }

  return `${BASE_PATH}/${pathString}`
}

export async function GetJsonFile(filePath: string) {
  VerifyFileExists(filePath)
  const json = require(filePath)
  return json
}

export function GetJsonFileSync(filePath: string) {
  VerifyFileExists(filePath)
  const json = require(filePath)
  return json
}

/**
 * Verify whether or not a file exists
 *
 * @param path The filesystem path to a file
 * @param notFoundMessage Optional message to include in Exception if file is not found
 */
export function VerifyFileExists(filePath: string, notFoundMessage?: string): boolean {
  if (!fs.existsSync(filePath)) {
    const exceptionMessage = notFoundMessage ? notFoundMessage : `A following file could not be found: ${path}`
    throw new FileException(exceptionMessage)
  }
  return true
}
