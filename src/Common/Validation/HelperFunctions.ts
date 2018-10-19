/**
 * Provides an error message indicating that a require field is missing
 *
 * @param field The name of the field that is missing
 * @param subject An optional owner of the required field
 */
export function MissingRequiredField(field: string, subject?: string) {
  return subject
    ? `${subject} requires a field named: ${field}. This value is missing.`
    : `The required field named: ${field} is missing.`
}

/**
 * Validate that the value is an array with atleast one item
 *
 * @param value The value to be checked
 */
export function HasItems(value: any[]) {
  return value.length > 0
}
