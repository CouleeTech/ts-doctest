import { FormParameterString, DeepObjectParameterString } from './ParameterString.Builder'
import { IsNumber, IsNullOrUndefined, IsString, IsObject, IsArray, IsFalsy } from '../Validation'

export type SimpleValue = string | number | null | undefined
export interface ISimpleObject {
  [key: string]: SimpleValue
}

export type SimpleType = SimpleValue | ISimpleObject

export type SimpleArray = SimpleType[]

export type QuerySimpleValue = SimpleType | SimpleArray

export type QueryArrayValue = QuerySimpleValue[]

export interface IQueryObjectValue {
  [key: string]: QuerySimpleValue
}

export interface ISimpleQueryPair {
  key: string
  value: QuerySimpleValue
}

export interface IArrayQueryPair {
  key: string
  value: QueryArrayValue
}

export interface IObjectQueryPair {
  key: string
  value: IQueryObjectValue
}

export type QueryValue = QuerySimpleValue | QueryArrayValue | IQueryObjectValue

export interface IQueryPair {
  key: string
  value: QueryValue
}

export type QueryPairs = IQueryPair[]

export type QueryStringConfig = IQueryPair | QueryPairs

export class QueryStringBuilderException extends Error {
  public constructor(message: string) {
    super(message)
  }
}

/**
 * Builds a query string to be used in URLs and documentation
 *
 * By default, this function will format empty, string, and array values into
 * the non-exploded form-style defined by RFC6570. However, objects will be
 * formatted in the exploded deepObject format.
 *
 * @param config All of the key value pairs associated with the query string
 */
export function BuildQueryString(config: QueryStringConfig): string {
  if (IsFalsy(config)) {
    throw new QueryStringBuilderException('Building a query string requires a valid query config.')
  }

  if (IsQueryPairArray(config)) {
    if (config.length < 1) {
      throw new QueryStringBuilderException('A query string config cannot be an empty array.')
    }
    return `?${config.map(pair => ParseQueryValuePair(pair)).join('&')}`
  } else {
    return `?${ParseQueryValuePair(config)}`
  }
}

/* ~~ Public Type Checkers ~~ */

/**
 * Check whether or not a query config is an array of query pairs
 *
 * @param config The query config being checked
 */
export function IsQueryPairArray(config: QueryStringConfig): config is QueryPairs {
  return IsArray(config)
}

/**
 * Check whether or not a query config is a single query pair
 *
 * @param config The query config being checked
 */
export function IsSingleQueryPair(config: QueryStringConfig): config is IQueryPair {
  return IsArray(config)
}

/* ~~ Query Value Parsers ~~ */

/**
 * Parse a query pair in a format that depends on the value's type
 *
 * @param pair The query pair being parsed
 */
function ParseQueryValuePair(pair: IQueryPair): string {
  if (IsSimpleValuePair(pair)) {
    return ParseSimpleValuePair(pair)
  } else if (IsArrayValuePair(pair)) {
    return ParseArrayValuePair(pair)
  } else if (IsObjectValuePair(pair)) {
    return ParseObjectValuePair(pair)
  }

  throw new QueryStringBuilderException('Failed to parse a query value pair. The pair is in an invalid type.')
}

/**
 * Format a simple query value pair into a string
 *
 * @param key The name of the query value
 * @param value The simple query value
 */
function ParseSimpleValuePair({ key, value }: ISimpleQueryPair): string {
  return FormParameterString(key, value, false) as string
}

/**
 * Format an array query value pair into a string
 *
 * @param key The name of the query value
 * @param value The array query value
 */
function ParseArrayValuePair({ key, value }: IArrayQueryPair): string {
  return FormParameterString(key, value, false) as string
}

/**
 * Format an object query value pair into a string
 *
 * @param key The name of the query value
 * @param value The object query value
 */
function ParseObjectValuePair({ key, value }: IObjectQueryPair): string {
  return DeepObjectParameterString(key, value) as string
}

/* ~~ Query Value Type Guards ~~ */

/**
 * Check whether or not a query pair is a simple value pair
 *
 * @param pair The query pair being checked
 */
function IsSimpleValuePair(pair: IQueryPair): pair is ISimpleQueryPair {
  return IsString(pair.value) || IsNumber(pair.value) || IsNullOrUndefined(pair.value)
}

/**
 * Check whether or not a query pair is an array value pair
 *
 * @param pair The query pair being checked
 */
function IsArrayValuePair(pair: IQueryPair): pair is IArrayQueryPair {
  return IsArray(pair.value)
}

/**
 * Check whether or not a query pair is an object value pair
 *
 * @param pair The query pair being checked
 */
function IsObjectValuePair(pair: IQueryPair): pair is IObjectQueryPair {
  return IsObject(pair.value)
}
