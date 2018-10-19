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
