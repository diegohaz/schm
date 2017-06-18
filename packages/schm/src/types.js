// @flow

export type Parser = (
  value: any,
  option: any,
  values?: Object,
  options?: Object,
  params?: Object,
) => any

export type Validator = (
  value: any,
  option: any,
  values?: Object,
  options?: Object,
  params?: Object,
) => boolean | Promise<any>

export type ValidatorObject = {
  validator: Validator,
  ['message' | 'msg']: string,
}

export type ValidationError = {
  value: any,
  validator: string,
  validatorValue: any,
  message?: string,
}

export type ValidationErrors = { [string]: ValidationError | ValidationErrors }

/** */
export type Schema = {
  params: Object,
  parsers: { [string]: Parser },
  validators: { [string]: Validator },
  parse: (values: Object) => Object,
  validate: (values: Object) => Promise<ValidationErrors>,
  merge: (...schemas: Schema[]) => Schema,
}

/** */
export type SchemaGroup = (previous: Schema) => Schema
