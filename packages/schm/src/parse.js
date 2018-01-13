// @flow
import { mapValuesToSchema } from './utils'
import type { Schema } from './types'

/**
 * Parses a schema based on given values.
 * @example
 * parse(
 *   schema({ foo: String, bar: Number }),
 *   { foo: 1, bar: '1' }
 * )
 * // -> { foo: '1', bar: 1 }
 *
 * // can also be used directly from schema
 * schema({ foo: String, bar: Number }).parse({ foo: 1, bar: '1' })
 */
const parse = (schema: Schema, values?: Object = {}): Object => (
  mapValuesToSchema(schema, values, (value, options, paramName) => (
    Object.keys(options).reduce((finalValue, optionName) => {
      const option = options[optionName]
      const parser = schema.parsers[optionName]

      if (typeof parser === 'function') {
        return parser(finalValue, option, values, options, schema.params)
      } else if (parser) {
        throw new Error(`[schm] ${paramName} parser must be a function`)
      }
      return finalValue
    }, value)))
)

export default parse
