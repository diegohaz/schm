// @flow
import isObject from 'lodash/isObject'
import parse from './parse'
import { walk } from './utils'
import type { Schema, ValidationErrors } from './types'

const flatten = (object) => {
  let flattened = {}

  for (let i in object) {
    const value = object[i]
    const isLast = Object.prototype.hasOwnProperty.call(value, 'value')
    if (isLast) {
      flattened[i] = value
      continue
    }
    const flatObject = flatten(value)
    for (let x in flatObject) {
      flattened[i + '.' + x] = flatObject[x]
    }
  }
  return flattened
}

const validate = (schema: Schema, values?: Object = {}): Promise<ValidationErrors> => {
  const parsed = parse(schema, values)

  const errors = walk(schema, parsed, (paramName, options, value) => (
    Object.keys(options).reduce((error, optionName) => {
      if (error) {
        return error
      }

      const option = options[optionName]
      const fn = schema.validators[optionName]

      if (typeof fn === 'function') {
        const valid = fn(value, option, parsed, options, schema.params)
        if (!valid) {
          return {
            value,
            validator: optionName,
          }
        }
      } else if (fn) {
        throw new Error(`[schm] ${paramName} validator must be a function`)
      }
      return error
    }, undefined)
  ))

  const flatErrors = flatten(errors)
  const arrayErrors = Object.keys(flatErrors).reduce((finalErrors, paramPath) => {
    const error = flatErrors[paramPath]
    if (typeof error !== 'undefined') {
      return [
        ...finalErrors,
        { param: paramPath, ...error },
      ]
    }
    return finalErrors
  }, [])
  console.log(arrayErrors)

  return arrayErrors.length ? Promise.reject(arrayErrors) : Promise.resolve()
}

export default validate
