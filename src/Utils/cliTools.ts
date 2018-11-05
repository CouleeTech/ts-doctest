/**
 * Removes leading indents from a template string without removing all leading whitespace
 */
export function Dedent(strings: TemplateStringsArray, ...values: any[]) {
  let fullString = strings.reduce((accumulator, str, i) => `${accumulator}${values[i - 1]}${str}`)

  // match all leading spaces/tabs at the start of each line
  const match = fullString.match(/^[ \t]*(?=\S)/gm)
  if (match === null) {
    // e.g. if the string is empty or all whitespace.
    return fullString
  }

  // find the smallest indent, we don't want to remove all leading whitespace
  const indent = Math.min(...match.map(el => el.length))
  const regexp = new RegExp(`^[ \\t]{${indent}}`, 'gm')
  fullString = indent > 0 ? fullString.replace(regexp, '') : fullString
  return fullString
}
