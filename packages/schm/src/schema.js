// @flow
import merge from 'lodash/merge'
import { type, set, get, lowercase, uppercase, trim, defaultParser } from './parsers'
import { required, validate as validateValidator } from './validators'
import { isSchema } from './utils'
import parse from './parse'
import validate from './validate'
import type { Schema, SchemaGroup } from './types'

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

  parsers: { type, set, get, lowercase, uppercase, trim, default: defaultParser },

  validators: { required, validate: validateValidator },

  parse(values) {
    return parse(this, values)
  },

  validate(values) {
    return validate(this, values)
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
export const group = (params?: Object = {}): SchemaGroup => (
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
const schema = (...groups: (Object | Schema | SchemaGroup)[]): Schema =>
  groups.reduce((finalSchema, currentGroup) => {
    if (typeof currentGroup === 'function') {
      return currentGroup(finalSchema)
    } else if (isSchema(currentGroup)) {
      return currentGroup
    }
    return group(currentGroup)(finalSchema)
  }, defaultSchema())

export default schema
