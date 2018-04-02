// @flow
import type { Schema, SchemaGroup } from "schm";

/**
 * Defines a `fields` parameter and parses it into [MongoDB projection](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/).
 * @example
 * const schema = require('schm')
 * const { fields } = require('schm-mongo')
 *
 * const fieldsSchema = schema(fields())
 * const parsed = fieldsSchema.parse({ fields: ['-_id', 'name'] })
 * // {
 * //   fields: {
 * //     _id: 0,
 * //     name: 1,
 * //   }
 * // }
 * db.collection.find({}, parsed.fields)
 * @example
 * // Configuring fields parameter
 * const schema = require('schm')
 * const { fields } = require('schm-mongo')
 *
 * const fieldsSchema = schema({
 *   fields: {
 *     type: String,
 *     validate: [value => value._id !== 0, 'Cannot hide _id'],
 *   },
 * }, fields())
 *
 * fieldsSchema.validate({ fields: ['-_id'] }) // error
 * @example
 * // Renaming fields
 * const schema = require('schm')
 * const translate = require('schm-translate')
 * const { fields } = require('schm-mongo')
 *
 * const fieldsSchema = schema(
 *   fields(),
 *   translate({ fields: 'select' })
 * )
 *
 * const parsed = fieldsSchema.parse({ select: ['-_id', 'name'] })
 * // {
 * //   fields: {
 * //     _id: 0,
 * //     name: 1,
 * //   }
 * // }
 * db.collection.find({}, parsed.fields)
 */
const fields = (): SchemaGroup => (previous: Schema) =>
  previous.merge({
    params: {
      fields: {
        type: String,
        set: value => {
          if (!value) return value;
          return value
            .split(",")
            .map(v => v.trim())
            .map(v => ({
              [v.replace(/^[+-]/, "")]: v.indexOf("-") === 0 ? 0 : 1
            }))
            .reduce((finalObject, currentObject) => ({
              ...finalObject,
              ...currentObject
            }));
        }
      }
    }
  });

export default fields;
