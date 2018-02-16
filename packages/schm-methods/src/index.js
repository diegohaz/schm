// @flow

/**
 * Adds methods to schm parsed object.
 */
const methods = (params: Object) => (previous: any) =>
  previous.merge({
    parse(...args) {
      const parsed = previous.parse(...args)

      Object.keys(params).forEach(name => {
        const fn = params[name]
        if (typeof fn !== 'function') {
          throw new Error(`[schm-methods] ${name} must be a function`)
        }
        parsed[name] = fn.bind(parsed, parsed)
      })

      return parsed
    },
  })

module.exports = methods
