// @flow
import type { Schema } from './types'

type TransformValueFunction = (
  value: any,
  options: Object,
  paramName: string,
  paramPath: string,
) => any

export const isSchema = (schema: ?Schema): boolean => !!(
  schema &&
  schema.params &&
  schema.parsers &&
  schema.validators &&
  schema.parse &&
  schema.validate &&
  schema.merge
)

export const mapValuesToSchema = (
  schema: Schema,
  values: Object,
  transformValue: TransformValueFunction,
  paramNames: string[] = []
): Object => (
  Object.keys(schema.params).reduce((finalParams, paramName) => {
    const options = schema.params[paramName]
    const value = values[paramName]
    let finalValue

    if (isSchema(options)) {
      finalValue = value ? mapValuesToSchema(
        options,
        value,
        transformValue,
        [...paramNames, paramName]
      ) : undefined
    } else if (Array.isArray(options)) {
      const arrayValue = [].concat(value || [])

      if (isSchema(options[0])) {
        finalValue = arrayValue.map((val, i) =>
          mapValuesToSchema(
            options[0],
            val,
            transformValue,
            [...paramNames, paramName, `${i}`]
          ))
      } else {
        finalValue = arrayValue.map((val, i) =>
          transformValue(
            val,
            options[0],
            paramName,
            [...paramNames, paramName, i].join('.')
          ))
      }
    } else {
      finalValue = transformValue(
        value,
        options,
        paramName,
        [...paramNames, paramName].join('.')
      )
    }

    return {
      ...finalParams,
      [paramName]: finalValue,
    }
  }, {})
)
