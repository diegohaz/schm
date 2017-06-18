// @flow
import type { Schema } from './types'

export const isSchema = (schema: ?Schema): boolean => !!(
  schema &&
  schema.params &&
  schema.parsers &&
  schema.validators &&
  schema.parse &&
  schema.validate &&
  schema.merge
)

export const walk = (
  schema: Schema,
  values: Object,
  fn: (paramName: string, options: Object, value: any) => any
): Object => (
  Object.keys(schema.params).reduce((finalParams, paramName) => {
    const options = schema.params[paramName]
    const value = values[paramName]
    let finalValue

    if (isSchema(options)) {
      finalValue = walk(options, value, fn)
    } else if (Array.isArray(options) && isSchema(options[0])) {
      const arrayValue = Array.isArray(value) ? value : [value]
      finalValue = arrayValue.map(val => walk(options[0], val, fn))
    } else {
      finalValue = fn(paramName, options, value)
    }

    return {
      ...finalParams,
      [paramName]: finalValue,
    }
  }, {})
)
