// @flow
import createSchema from "./schema";
import mapValues from "./mapValues";

/**
 * Parses a schema based on given values.
 * @example
 * const { parse } = require('schm')
 *
 * parse(
 *   { foo: 1, bar: '1' },
 *   { foo: String, bar: Number },
 * )
 * // -> { foo: '1', bar: 1 }
 *
 * // can also be used directly from schema
 * schema({ foo: String, bar: Number }).parse({ foo: 1, bar: '1' })
 */
const parse = (values?: Object = {}, params: Object): Object => {
  const schema = createSchema(params);
  const transformValue = (value, options, paramName, paramPath) =>
    Object.keys(options).reduce((finalValue, optionName) => {
      const option = options[optionName];
      const parser = schema.parsers[optionName];

      if (typeof parser === "function") {
        return parser(finalValue, option, paramPath, options, values, schema);
      }
      if (parser) {
        throw new Error(`[schm] ${paramName} parser must be a function`);
      }
      return finalValue;
    }, value);
  return mapValues(values, schema.params, transformValue);
};

export default parse;
