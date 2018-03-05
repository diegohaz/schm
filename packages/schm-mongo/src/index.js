// @flow
import parsers from './parsers'
import flatten from './flatten'
import parsePaths from './parsePaths'
import removeUndefined from './removeUndefined'

export const query = (params: Object) => (previous: any) =>
  previous.merge({
    params,
    parsers,
    parse(values = {}) {
      const parsed = previous.parse.call(this, values)
      return parsePaths(removeUndefined(flatten(parsed)), this.params)
    },
  })

export const cursor = () => {}
