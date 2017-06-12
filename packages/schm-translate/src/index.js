// @flow
import get from 'lodash/get'

/**
 * Translates values keys to schema keys.
 */
const translate = (params: Object) => (previous: any) => previous.merge({
  parse(values = {}) {
    const parsedValues = Object.keys(params).reduce((finalValues, param) => ({
      ...finalValues,
      [param]: get(finalValues, params[param]),
    }), values)

    return previous.parse(parsedValues)
  },
})

module.exports = translate
