// @flow
import parsers from './parsers'
import flatten from './flatten'
import parsePaths from './parsePaths'
import removeUndefined from './removeUndefined'
import type { PathsMap } from '.'

/**
 * Applies `operator` parser to the schema. Also translates fields to paths.
 * @example
 * const querySchema = schema({
 *   term: RegExp,
 *   after: { type: Date, operator: '$gte' },
 *   before: { type: Date, operator: '$lte' },
 * }, query({
 *   term: ['title', 'description'],
 *   after: 'date',
 *   before: 'date',
 * }))
 *
 * querySchema.parse({ term: 'foo', after: '2018-01-01', before: '2018-03-03' })
 * // {
 * //   $and: [
 * //     { $or: [{ title: /foo/i }, { description: /foo/i }] },
 * //     { date: { $gte: 1514764800000 } },
 * //     { date: { $lte: 1520035200000 } },
 * //   ],
 * // }
 */
const query = (pathsMap: PathsMap) => (previous: any) =>
  previous.merge({
    parsers,
    parse(values) {
      const parsed = previous.parse.call(this, values)
      return parsePaths(removeUndefined(flatten(parsed)), pathsMap)
    },
  })

export default query
