/**
 * Check to see if a value is an object
 *
 * @param value The value to be checked
 */
export function IsObject(value: any) {
  return value && typeof value === 'object' && value.constructor === Object
}

/**
 * Check to see if a value is a string
 *
 * @param value The value to be checked
 */
export function IsString(value: any) {
  return typeof value === 'string' || value instanceof String
}
