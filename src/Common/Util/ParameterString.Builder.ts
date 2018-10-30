import { IsObject, IsArray, IsString, IsNumber, IsFalsy } from '../Validation'

export type ParameterString = string

const UNEXPECTED_PARAMETER_VALUE = 'Unexpected parameter string value'

export class ParameterException extends Error {
  public constructor(message: string) {
    super(message)
  }
}

/**
 * Build a form-style parameter string
 *
 * This format is defined by RFC6570.
 *
 * @param name The name of the parameter.
 * @param value The value of the parameter.
 * @param explode Build the parameter string in an expanded format.
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

  return UnexpectedValue(value)
}

/**
 * Build a label-style parameter string
 *
 * This format is defined by RFC6570.
 *
 * @param value The value of the parameter.
 * @param explode Build the parameter string in an expanded format.
 */
export function LabelParameterString(value: any, explode: boolean = false) {
  if (IsFalsy(value)) {
    return `.`
  } else if (IsString(value) || IsNumber(value)) {
    return `.${value}`
  } else if (IsArray(value)) {
    return `.${value.join('.')}`
  } else if (IsObject(value)) {
    if (explode) {
      return `.${Object.keys(value)
        .map(key => `${key}=${value[key]}`)
        .join('.')}`
    }

    const valueString = Object.keys(value)
      .map(key => `${key}.${value[key]}`)
      .join('.')

    return `.${valueString}`
  }

  return UnexpectedValue(value)
}

/**
 * Build a matrix-style parameter string
 *
 * This format is defined by RFC6570.
 *
 * @param name The name of the parameter.
 * @param value The value of the parameter.
 * @param explode Build the parameter string in an expanded format.
 */
export function MatrixParameterString(name: string, value: any, explode: boolean = false) {
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

  return UnexpectedValue(value)
}

/**
 * Build a simple-style parameter string
 *
 * This format is defined by RFC6570.
 *
 * @param value The value of the parameter.
 * @param explode Build the parameter string in an expanded format.
 */
export function SimpleParameterString(value: any, explode: boolean = false) {
  if (IsFalsy(value)) {
    NotAcceptable('Falsy', 'simple-style')
  } else if (IsString(value) || IsNumber(value)) {
    return value
  } else if (IsArray(value)) {
    return value.join(',')
  } else if (IsObject(value)) {
    if (explode) {
      return `${Object.keys(value)
        .map(key => `${key}=${value[key]}`)
        .join(',')}`
    }

    return `${Object.keys(value)
      .map(key => `${key},${value[key]}`)
      .join(',')}`
  }

  return UnexpectedValue(value)
}

/**
 * Build a space-delimited parameter string
 *
 * @param value The value of the parameter.
 */
export function SpaceDelimitedParameterString(value: any) {
  if (IsFalsy(value)) {
    NotAcceptable('Falsy', 'space-delimited')
  } else if (IsString(value) || IsNumber(value)) {
    NotAcceptable('String or Number', 'space-delimited')
  } else if (IsArray(value)) {
    return value.join('%20')
  } else if (IsObject(value)) {
    return `${Object.keys(value)
      .map(key => `${key}%20${value[key]}`)
      .join('%20')}`
  }

  return UnexpectedValue(value)
}

/**
 * Build a pipe-delimited parameter string
 *
 * @param value The value of the parameter.
 */
export function PipeDelimitedParameterString(value: any) {
  if (IsFalsy(value)) {
    NotAcceptable('Falsy', 'pipe-delimited')
  } else if (IsString(value) || IsNumber(value)) {
    NotAcceptable('String or Number', 'pipe-delimited')
  } else if (IsArray(value)) {
    return value.join('|')
  } else if (IsObject(value)) {
    return `${Object.keys(value)
      .map(key => `${key}|${value[key]}`)
      .join('|')}`
  }

  return UnexpectedValue(value)
}

/**
 * Build a deep object parameter string
 *
 * @param name The name of the parameter.
 * @param value The value of the parameter.
 */
export function DeepObjectParameterString(name: string, value: any) {
  if (IsFalsy(value)) {
    NotAcceptable('Falsy', 'deep object')
  } else if (IsString(value) || IsNumber(value)) {
    NotAcceptable('String or Number', 'deep object')
  } else if (IsArray(value)) {
    NotAcceptable('Array', 'deep object')
  } else if (IsObject(value)) {
    return `${Object.keys(value)
      .map(key => `${name}[${key}]=${value[key]}`)
      .join('&')}`
  }

  return UnexpectedValue(value)
}

function NotAcceptable(type: string, style: string): ParameterException {
  throw new ParameterException(`${type} values are not valid for ${style} parameters`)
}

function UnexpectedValue(value: any): ParameterException {
  throw new ParameterException(`${UNEXPECTED_PARAMETER_VALUE}: ${value}`)
}
