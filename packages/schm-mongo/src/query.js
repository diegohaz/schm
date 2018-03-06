// @flow
import parsers from './parsers'
import flatten from './flatten'
import parsePaths from './parsePaths'
import removeUndefined from './removeUndefined'

const query = (pathsMap: Object) => (previous: any) =>
  previous.merge({
    parsers,
    parse(values) {
      const parsed = previous.parse.call(this, values)
      return parsePaths(removeUndefined(flatten(parsed)), pathsMap)
    },
  })

export default query
