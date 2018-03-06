// @flow
import type { Parser } from 'schm'

export const operator: Parser = (value, option) => {
  if (Array.isArray(value)) {
    const arrayOperatorMap = {
      $eq: '$in',
      $ne: '$nin',
    }
    if (arrayOperatorMap[option]) {
      return { [arrayOperatorMap[option]]: value }
    }
  }

  if (option === '$eq') {
    return value
  }

  return { [option]: value }
}

export default {
  operator,
}
