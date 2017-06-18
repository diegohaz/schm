// @flow
import type { Validator } from './types'

export const validate: Validator = (value, option) => {
  if (typeof option === 'function') {
    return option(value)
  }
  return true
}

export const required: Validator = (value, option) => {
  if (option) {
    return value != null && value !== '' && !Number.isNaN(value)
  }
  return true
}
