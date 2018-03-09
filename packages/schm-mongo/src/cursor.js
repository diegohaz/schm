import merge from 'lodash/merge'
import removeUndefined from './removeUndefined'

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

const cursor = () => previous =>
  previous.merge({
    params: merge({}, params, previous.params),
    parse(values) {
      const { page, limit, sort, ...parsed } = previous.parse.call(this, values)
      const skip = (page - 1) * limit
      return {
        ...parsed,
        cursor: removeUndefined({
          skip,
          limit,
          sort,
        }),
      }
    },
  })

export default cursor
