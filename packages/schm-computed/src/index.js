// @flow
/**
 * Add computed parameters to schema.
 */
const computed = (params: Object) => (previous: any) => previous.merge({
  parse(...args) {
    const parsed = previous.parse(...args)

    Object.keys(params).forEach((name) => {
      const fn = params[name]
      if (typeof fn !== 'function') {
        throw new Error(`[schm-computed] ${name} must be a function`)
      }

      parsed[name] = fn(parsed)
    })

    return parsed
  },
})

module.exports = computed
