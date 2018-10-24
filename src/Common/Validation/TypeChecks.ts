/**
 * Validate that the value is an array
 *
 * @param value The value to be checked
 */
export function IsArray(value: any) {
  return Array.isArray(value)
}

/**
 * Validate that the value is falsy
 *
 * @param value The value to be checked
 */
export function IsFalsy(value: any) {
  return !value
}

/**
 * Validate that the value is a number
 *
 * @param value The value to be checked
 */
export function IsNumber(value: any) {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Validate that the value is an object
 *
 * @param value The value to be checked
 */
export function IsObject(value: any) {
  return value && typeof value === 'object' && value.constructor === Object
}

/**
 * Validate that the value is a string
 *
 * @param value The value to be checked
 */
export function IsString(value: any) {
  return typeof value === 'string' || value instanceof String
}
