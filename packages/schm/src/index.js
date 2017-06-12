// @flow
import merge from 'lodash/merge'
import { type, set, get, defaultParser } from './parsers'
import type { Schema, SchemaGroup } from './types'

/**
 * Parses a schema based on given values.
 * @example
 * parse(
 *  schema({ foo: String, bar: Number }),
 *  { foo: 1, bar: '1' }
 * )
 * // -> { foo: '1', bar: 1 }
 *
 * // can also be used directly from schema
 * schema({ foo: String, bar: Number }).parse({ foo: 1, bar: '1' })
 */
const parse = (schema: Schema, values?: Object = {}): Object => {
  const params = schema.params

  return Object.keys(params).reduce((parsed, paramName) => {
    const options = params[paramName]
    const valueObject = { [paramName]: values[paramName] }
    const isSchema = o => o.params && o.parsers && o.parse && o.merge

    if (isSchema(options)) {
      valueObject[paramName] = parse(options, values[paramName])
    } else if (Array.isArray(options) && isSchema(options[0])) {
      const arrayValues = Array.isArray(values[paramName])
        ? values[paramName]
        : [values[paramName]]

      valueObject[paramName] = arrayValues.map(value => parse(options[0], value))
    } else {
      Object.keys(options).forEach((optionName) => {
        const option = options[optionName]
        const fn = schema.parsers && schema.parsers[optionName]

        if (typeof fn === 'function') {
          valueObject[paramName] = fn(valueObject[paramName], option, values, options, params)
        } else if (fn) {
          throw new Error(`[schm] ${paramName} parser must be a function`)
        }
      })
    }

    return {
      ...parsed,
      ...valueObject,
    }
  }, {})
}

const defaultSchema = (params?: Object = {}): Schema => ({
  params: Object.keys(params).reduce((finalParams, name) => {
    const isLiteralType = options => typeof options === 'function'

    const isDefaultValue = options =>
      !isLiteralType(options) && typeof options !== 'object'

    const isNestedObject = options =>
      !Array.isArray(options) &&
      !isLiteralType(options) &&
      !isDefaultValue(options) &&
      !options.type

    const isArrayWithNestedObject = options =>
      Array.isArray(options) && isNestedObject(options[0])

    let options = params[name]

    if (isLiteralType(options)) {
      options = { type: options }
    } else if (isDefaultValue(options)) {
      options = { type: options.constructor, default: options }
    } else if (isArrayWithNestedObject(options)) {
      options = [defaultSchema(options[0])]
    } else if (isNestedObject(options)) {
      options = defaultSchema(options)
    }

    return {
      ...finalParams,
      [name]: options,
    }
  }, {}),

  parsers: { type, set, get, default: defaultParser },

  parse(values) {
    return parse(this, values)
  },

  merge(...schemas) {
    return merge({}, this, ...schemas)
  },
})

/**
 * A simple group of parameters. It's used internally when you pass literal
 * objects to [`schema`](#schema).
 * @example
 * const userSchema = schema(
 *   group({
 *     id: String,
 *     name: String,
 *   }),
 *   group({
 *     age: Number,
 *   })
 * )
 */
const group = (params?: Object = {}): SchemaGroup => (
  (previous: Schema): Schema => previous.merge(defaultSchema(params))
)

/**
 * Creates a schema by composing groups of parameters.
 * @example
 * const userSchema = schema({
 *   id: String,
 *   name: String,
 * }, {
 *   age: Number
 * })
 */
const schema = (...groups: (Object | SchemaGroup)[]): Schema =>
  groups.reduce((finalSchema, currentGroup) => (
    typeof currentGroup === 'function'
      ? currentGroup(finalSchema)
      : group(currentGroup)(finalSchema)
  ), defaultSchema())

module.exports = schema
module.exports.group = group
module.exports.parse = parse
