// @flow
import { walk } from './utils'
import type { Schema } from './types'

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
const parse = (schema: Schema, values?: Object = {}): Object => (
  walk(schema, values, (paramName, options, value) => (
    Object.keys(options).reduce((finalValue, optionName) => {
      const option = options[optionName]
      const fn = schema.parsers[optionName]

      if (typeof fn === 'function') {
        return fn(finalValue, option, values, options, schema.params)
      } else if (fn) {
        throw new Error(`[schm] ${paramName} parser must be a function`)
      }
      return finalValue
    }, value))
  )
)

export default parse
