import { IsObject, IsArray, IsString, IsNumber, IsFalsy } from '../Validation'

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
  if (IsFalsy(value)) {
    return `;${name}`
  } else if (IsString(value) || IsNumber(value)) {
    return `;${name}=${value}`
  } else if (IsArray(value)) {
    if (explode) {
      return `;${value.map((entry: any) => `${name}=${entry}`).join(';')}`
    }

    return `;${name}=${value.join(',')}`
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
  }

  throw new Error('Invalid parameter string value')
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
  if (IsFalsy(value)) {
    return `${name}=`
  } else if (IsString(value) || IsNumber(value)) {
    return `${name}=${value}`
  } else if (IsArray(value)) {
    if (explode) {
      return `${value.map((entry: any) => `${name}=${entry}`).join('&')}`
    }

    return `${name}=${value.join(',')}`
  } else if (IsObject(value)) {
    if (explode) {
      return `${Object.keys(value)
        .map(key => `${key}=${value[key]}`)
        .join('&')}`
    }

    const valueString = Object.keys(value)
      .map(key => [key, value[key]])
      .join(',')

    return `${name}=${valueString}`
  }

  throw new Error('Invalid parameter string value')
}
