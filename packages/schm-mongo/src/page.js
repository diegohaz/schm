// @flow
import type { Schema, SchemaGroup } from 'schm'
import merge from 'lodash/merge'
import removeUndefined from './removeUndefined'

/**
 * Pagination: parses `page`, `limit` and `sort` parameters into properties to be used within [MongoDB cursor methods](https://docs.mongodb.com/manual/reference/method/js-cursor).
 * @example
 * const schema = require('schm')
 * const { page } = require('schm-mongo')
 *
 * const pageSchema = schema(page())
 * const parsed = pageSchema.parse({ page: 3, limit: 30, sort: 'createdAt' })
 * // {
 * //   page: {
 * //     limit: 30,
 * //     skip: 60,
 * //     sort: { createdAt: 1 },
 * //   }
 * // }
 * @example
 * // Renaming page parameters
 * const schema = require('schm')
 * const translate = require('schm-translate')
 * const { page } = require('schm-mongo')
 *
 * const pageSchema = schema(
 *   page(),
 *   translate({ page: 'p', limit: 'size', sort: 'sort_by' })
 * )
 * const parsed = pageSchema.parse({ p: 3, size: 30, sort_by: 'createdAt' })
 * // {
 * //   page: {
 * //     limit: 30,
 * //     skip: 60,
 * //     sort: { createdAt: 1 },
 * //   }
 * // }
 */
const page = (): SchemaGroup => (previous: Schema) => {
  const params = {
    page: 1,
    limit: 20,
    sort: {
      type: String,
      set: value => {
        if (!value) return value
        return value
          .split(',')
          .map(v => v.trim())
          .map(v => ({
            [v.replace(/^[+-]/, '')]: v.indexOf('-') === 0 ? -1 : 1,
          }))
          .reduce((finalObject, currentObject) => ({
            ...finalObject,
            ...currentObject,
          }))
      },
    },
  }

  return previous.merge({
    params: merge({}, params, previous.params),
    parse(values) {
      const { page: pageNumber, limit, sort, ...parsed } = previous.parse.call(
        this,
        values,
      )
      const skip = (pageNumber - 1) * limit
      return {
        ...parsed,
        page: removeUndefined({
          skip,
          limit,
          sort,
        }),
      }
    },
  })
}
export default page
