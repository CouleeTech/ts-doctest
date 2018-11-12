import * as fs from 'graceful-fs'
import * as jsonfile from 'jsonfile'
import * as path from 'path'

import { IsString } from '../Validation/TypeChecks'

export class FileException extends Error {
  public constructor(message: string) {
    super(message)
  }
}

const BASE_PATH = path.resolve('.')

/**
 * List all of the contents of a directory
 *
 * @param directoryPath The path to the directory
 */
export function GetDirectoryContents(directoryPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

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

/* ~~~ JSON Functions ~~~ */

export async function GetJsonFile<T>(filePath: string): Promise<T> {
  return (await jsonfile.readFile(filePath)) as any
}

export function GetJsonFileSync(filePath: string) {
  VerifyFileExistsSync(filePath)
  return jsonfile.readFileSync(filePath)
}

export async function WriteJsonFile(filePath: string, data: any) {
  return await jsonfile.writeFile(filePath, data)
}

export function WriteJsonFileSync(filePath: string, data: any) {
  return jsonfile.writeFileSync(filePath, data)
}

/**
 * Verify whether or not a file exists
 *
 * @param filePath The filesystem path to a file
 * @param notFoundMessage Optional message to include in Exception if file is not found
 */
export function VerifyFileExistsSync(filePath: string, notFoundMessage?: string): boolean {
  if (!fs.existsSync(filePath)) {
    const exceptionMessage = notFoundMessage ? notFoundMessage : `A following file could not be found: ${filePath}`
    throw new FileException(exceptionMessage)
  }
  return true
}

/**
 * Verify whether or not a directory exists
 *
 * If the directory does not exist or is not a directory, a new directory will be created. If
 * necessary, any files with the same name as the directory will be deleted.
 *
 * @param directoryPath The filesystem path to a directory
 */
export function VerifyDirectoryExistsSync(directoryPath: string) {
  const exists = fs.existsSync(directoryPath)

  if (!exists) {
    fs.mkdirSync(directoryPath)
    return
  }

  const isADirectory = fs.lstatSync(directoryPath).isDirectory()

  if (!isADirectory) {
    fs.unlinkSync(directoryPath)
    fs.mkdirSync(directoryPath)
  }
}
