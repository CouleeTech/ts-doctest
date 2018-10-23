import { IsObject, IsArray, IsString, IsNumber } from '../Validation'

export type QueryString = string

/**
 * Build a matrix-style query string
 *
 * This format is defined by RFC6570.
 *
 * @param name The name of the query parameter
 * @param value The value of the query parameter.
 * @param explode Build the query string in an expanded format.
 */
export function MatrixQueryString(name: string, value: any, explode: boolean = false): QueryString {
  if (IsString(value) || IsNumber(value)) {
    return `;${name}=${value}`
  } else if (IsObject(value)) {
    if (explode) {
      return `;${Object.keys(value)
        .map(key => `${key}=${value[key]}`)
        .join(';')}`
    }

    const valueString = Object.keys(value)
      .map(key => [key, value[key]])
      .join(',')

    return `;${name}=${valueString}`
  } else if (IsArray(value)) {
    if (explode) {
      return `;${value.map((entry: any) => `${name}=${entry}`).join(';')}`
    }

    return `;${name}=${value.join(',')}`
  }

  throw new Error('Invalid query string value')
}
