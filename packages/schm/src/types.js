// @flow

/** */
export type Parser = (
  value: any,
  option: any,
  values: Object,
  options: Object,
  params: Object
) => any

/** */
export type Schema = {
  params: Object,
  parsers: { [string]: Parser },
  parse: (values: Object) => Object,
  merge: (...schemas: Schema[]) => Schema
}

/** */
export type SchemaGroup = (previous: Schema) => Schema
