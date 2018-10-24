import { IsObject, IsArray, IsString, IsNumber } from '../Validation'

export type ParameterString = string

/**
 * Build a matrix-style parameter string
 *
 * This format is defined by RFC6570.
 *
 * @param name The name of the parameter parameter
 * @param value The value of the parameter parameter.
 * @param explode Build the parameter string in an expanded format.
 */
export function MatrixParameterString(name: string, value: any, explode: boolean = false): ParameterString {
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

/**
 * Build a form-style parameter string
 *
 * This format is defined by RFC6570.
 *
 * @param name The name of the parameter parameter
 * @param value The value of the parameter parameter.
 * @param explode Build the parameter parameter in an expanded format.
 */
export function FormParameterString(name: string, value: any, explode: boolean = true) {
  if (name || value || explode) return
}
