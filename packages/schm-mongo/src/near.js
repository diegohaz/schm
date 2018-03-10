// @flow
import type { Schema, SchemaGroup } from 'schm'
import merge from 'lodash/merge'
import removeUndefined from './removeUndefined'

/**
 * Cacete.
 */
const near = (param: string): SchemaGroup => (previous: Schema) => {
  const params = {
    near: {
      type: String,
      set: value => {
        if (!value) return value
        return value.split(',').map(v => +v.trim())
      },
    },
    min_distance: Number,
    max_distance: Number,
  }
  return previous.merge({
    params: merge({}, params, previous.params),
    parse(values) {
      const {
        near: coordinates,
        min_distance: $minDistance,
        max_distance: $maxDistance,
        parsed,
      } = previous.parse.call(this, values)
      if (coordinates) {
        return {
          ...parsed,
          [param]: {
            $near: removeUndefined({
              $geometry: {
                type: 'Point',
                coordinates,
              },
              $minDistance,
              $maxDistance,
            }),
          },
        }
      }
      return parsed
    },
  })
}

export default near
