// @flow
import omit from 'lodash/omit'
import type { Validator } from './types'

type ParsedOption = {
  optionValue: any,
  message?: string,
}

const isArrayAndHasMessage = (option: any): boolean => (
  Array.isArray(option) &&
  option.length === 2 &&
  typeof option[1] === 'string'
)

const isValidatorObject = (option: any): boolean => (
  option && (option.message || option.msg)
)

const parseOption = (option: any, ignoreArray?: boolean): ParsedOption => {
  if (!ignoreArray && isArrayAndHasMessage(option)) {
    return {
      optionValue: option[0],
      message: option[1],
    }
  } else if (isValidatorObject(option)) {
    const optionWithoutMessage = omit(option, 'message', 'msg')
    const optionValueKey = Object.keys(optionWithoutMessage)[0]
    return {
      optionValue: optionWithoutMessage[optionValueKey],
      message: option.message || option.msg,
    }
  }
  return { optionValue: option }
}

export const validate: Validator = (value, option, values, options, params) => {
  const { optionValue, message } = parseOption(option)
  if (Array.isArray(optionValue)) {
    return optionValue.reduce((response, currentOption) => (
      !response.valid ? response : validate(value, currentOption)
    ), { valid: true })
  }
  if (typeof optionValue !== 'function') {
    throw new Error('[schm] validate must be a function')
  }
  return {
    valid: optionValue(value, values, options, params),
    message,
  }
}

export const required: Validator = (value, option) => {
  const { optionValue, message } = parseOption(option)
  const valid = optionValue
    ? value != null && value !== '' && !Number.isNaN(value)
    : true
  return {
    valid,
    message: message || '{PARAM} is required',
  }
}

export const match: Validator = (value, option) => {
  const { optionValue, message } = parseOption(option)
  if (!(optionValue instanceof RegExp)) {
    throw new Error('[schm] match must be a regex')
  }
  return {
    valid: !value || optionValue.test(value),
    message: message || '{PARAM} does not match',
  }
}

export const enumValidator: Validator = (value, option) => {
  const { optionValue, message } = parseOption(option, true)
  if (!Array.isArray(optionValue)) {
    throw new Error('[schm] enum must be an array')
  }
  return {
    valid: optionValue.indexOf(value) >= 0,
    message: message || `{PARAM} must be one of the following: ${optionValue.join(', ')}`,
  }
}

export const max: Validator = (value, option) => {
  const { optionValue, message } = parseOption(option)
  return {
    valid: typeof value === 'undefined' || value <= optionValue,
    message: message || `{PARAM} must be lower than or equal ${optionValue}`,
  }
}

export const min: Validator = (value, option) => {
  const { optionValue, message } = parseOption(option)
  return {
    valid: typeof value === 'undefined' || value >= optionValue,
    message: message || `{PARAM} must be greater than or equal ${optionValue}`,
  }
}

export const maxlength: Validator = (value, option) => {
  const { optionValue, message } = parseOption(option)
  return {
    valid: typeof value === 'undefined' || value.length <= optionValue,
    message: message || `{PARAM} length must be lower than or equal ${optionValue}`,
  }
}

export const minlength: Validator = (value, option) => {
  const { optionValue, message } = parseOption(option)
  return {
    valid: typeof value === 'undefined' || value.length >= optionValue,
    message: message || `{PARAM} length must be greater than or equal ${optionValue}`,
  }
}

export default {
  required,
  match,
  enum: enumValidator,
  max,
  min,
  maxlength,
  minlength,
  validate,
}
