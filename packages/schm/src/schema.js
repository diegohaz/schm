// @flow
import merge from "lodash/merge";
import type { Schema, SchemaGroup } from ".";
import { isSchema } from "./utils";
import parsers from "./parsers";
import validators from "./validators";
import parse from "./parse";
import validate from "./validate";
import parseParams from "./parseParams";

export const defaultSchema = (params?: Object = {}): Schema => ({
  parsers,
  validators,
  parse(values) {
    return parse(values, this);
  },
  validate(values, paramPathPrefix) {
    return validate(values, this, paramPathPrefix);
  },
  merge(...schemas) {
    const merged = merge({}, this, ...schemas);
    return {
      ...merged,
      params: parseParams(merged.params)
    };
  },
  params: parseParams(params)
});

/**
 * A simple group of parameters. It's used internally when you pass literal
 * objects to [`schema`](#schema).
 * @example
 * const schema = require('schm')
 * const { group } = schema
 *
 * const userSchema = schema(
 *   group({
 *     id: String,
 *     name: String,
 *   }),
 *   group({
 *     age: Number,
 *   })
 * )
 */
export const group = (params?: Object = {}): SchemaGroup => (
  previous: Schema
): Schema => previous.merge(defaultSchema(params));

/**
 * Creates a schema by composing groups of parameters.
 * @example
 * const schema = require('schm')
 *
 * const userSchema = schema({
 *   id: String,
 *   name: String,
 * }, {
 *   age: Number
 * })
 *
 * // nested schema
 * const teamSchema = schema({
 *   users: [userSchema],
 * })
 */
const schema = (...groups: (Object | Schema | SchemaGroup)[]): Schema =>
  groups.reduce((finalSchema, currentGroup) => {
    if (typeof currentGroup === "function") {
      return currentGroup(finalSchema);
    }
    if (isSchema(currentGroup)) {
      return finalSchema.merge(currentGroup);
    }
    return group(currentGroup)(finalSchema);
  }, defaultSchema());

export default schema;
