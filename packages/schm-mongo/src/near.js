// @flow
import type { Schema, SchemaGroup } from "schm";
import merge from "lodash/merge";
import removeUndefined from "./removeUndefined";

/**
 * Creates a [geospatial query](https://docs.mongodb.com/manual/geospatial-queries/) based on values.
 * @example
 * const schema = require('schm')
 * const { near } = require('schm-mongo')
 *
 * const nearSchema = schema(near('location'))
 *
 * const parsed = nearSchema.parse({
 *   near: '-20.4321,44.4321',
 *   min_distance: 1000,
 *   max_distance: 2000,
 * })
 * // {
 * //   location: {
 * //     $near: {
 * //       $geometry: {
 * //         type: 'Point',
 * //         coordinates: [-20.4321, 44.4321],
 * //       },
 * //       $minDistance: 1000,
 * //       $maxDistance: 2000,
 * //     },
 * //   }
 * // }
 * @example
 * // renaming near parameters
 * const schema = require('schm')
 * const translate = require('schm-translate')
 * const { near } = require('schm-mongo')
 *
 * const nearSchema = schema(
 *   near('location'),
 *   translate({ near: 'lnglat', min_distance: 'min', max_distance: 'max' })
 * )
 *
 * const parsed = nearSchema.parse({
 *   lnglat: '-20.4321,44.4321',
 *   min: 1000,
 *   max: 2000,
 * })
 * // {
 * //   location: {
 * //     $near: {
 * //       $geometry: {
 * //         type: 'Point',
 * //         coordinates: [-20.4321, 44.4321],
 * //       },
 * //       $minDistance: 1000,
 * //       $maxDistance: 2000,
 * //     },
 * //   }
 * // }
 */
const near = (param: string): SchemaGroup => (previous: Schema) => {
  const params = {
    near: {
      type: String,
      set: value => {
        if (!value) return value;
        return value.split(",").map(v => +v.trim());
      }
    },
    min_distance: Number,
    max_distance: Number
  };
  return previous.merge({
    params: merge({}, params, previous.params),
    parse(values) {
      const {
        near: coordinates,
        min_distance: $minDistance,
        max_distance: $maxDistance,
        ...parsed
      } = previous.parse.call(this, values);
      if (coordinates) {
        return {
          ...parsed,
          [param]: {
            $near: removeUndefined({
              $geometry: {
                type: "Point",
                coordinates
              },
              $minDistance,
              $maxDistance
            })
          }
        };
      }
      return parsed;
    }
  });
};

export default near;
