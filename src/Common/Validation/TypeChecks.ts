/**
 * Validate that the value is an array
 *
 * @param value The value to be checked
 */
export function IsArray(value: any): value is any[] {
  return Array.isArray(value)
}

/**
 * Validate that the value is falsy
 *
 * @param value The value to be checked
 */
export function IsFalsy(value: any): value is false {
  return !Boolean(value)
}

/**
 * Validate that the value is a function
 *
 * @param value The value that is being checked
 */
export function IsFunction(value: any): value is (...args: any) => any {
  return typeof value === 'function'
}

/**
 * Validate that the value is null
 *
 * @param value The value to be checked
 */
export function IsNull(value: any): value is null {
  return value === null
}

/**
 * Validate that the value is null or undefined
 *
 * @param value The value to be checked
 */
export function IsNullOrUndefined(value: any): value is null {
  return IsNull(value) || IsUndefined(value)
}

/**
 * Validate that the value is a number
 *
 * @param value The value to be checked
 */
export function IsNumber(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Validate that the value is an object
 *
 * @param value The value to be checked
 */
export function IsObject(value: any): value is { [key: string]: any } {
  return value && typeof value === 'object' && value.constructor === Object
}

/**
 * Validate that the value is a string
 *
 * @param value The value to be checked
 */
export function IsString(value: any): value is string {
  return typeof value === 'string' || value instanceof String
}

/**
 * Validate that the value is undefined
 *
 * @param value The value to be checked
 */
export function IsUndefined(value: any): value is undefined {
  return typeof value === 'undefined'
}
