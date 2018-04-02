// @flow
import type { ValidationError } from ".";
import createSchema from "./schema";
import mapValues from "./mapValues";
import { parseValidatorOption, toArray } from "./utils";

const isPrimitive = arg =>
  arg == null || (typeof arg !== "object" && typeof arg !== "function");

const replaceMessage = (
  message: string,
  paramName: string,
  value: any,
  validatorName: string
): string =>
  message
    .replace(/\{(PARAM|PATH)\}/g, paramName)
    .replace(/\{VALUE\}/g, value)
    .replace(/\{(VALIDATOR|TYPE)\}/g, validatorName);

const createErrorObject = (
  param: string,
  value: any,
  validator: string,
  optionValue: any,
  message?: string
): ValidationError => ({
  param,
  ...(isPrimitive(value) ? { value } : {}),
  validator,
  ...(isPrimitive(optionValue) ? { [validator]: optionValue } : {}),
  ...(message
    ? { message: replaceMessage(message, param, value, validator) }
    : {})
});

/**
 * Validates a schema based on given values.
 * @example
 * const schema = require('schm')
 * const { validate } = schema
 *
 * const userSchema = schema({
 *   name: {
 *     type: String,
 *     required: true,
 *   },
 *   age: {
 *     type: Number,
 *     min: [18, 'Too young'],
 *   }
 * })
 *
 * validate({ name: 'John', age: 17 }, userSchema)
 *   .then((parsedValues) => {
 *     console.log('Yaay!', parsedValues)
 *   })
 *   .catch((errors) => {
 *     console.log('Oops!', errors)
 *   })
 *
 * // Output:
 * // Oops! [{
 * //   param: 'age',
 * //   value: 17,
 * //   validator: 'min',
 * //   min: 18,
 * //   message: 'Too young',
 * // }]
 */
const validate = (
  values?: Object = {},
  params: Object,
  paramPathPrefix?: string
): Promise<ValidationError[]> => {
  const schema = createSchema(params);
  const parsed = schema.parse(values);
  const promises = [];
  const errors = [];

  const transformValue = (value, options, paramName, paramPath) => {
    Object.keys(options).forEach(optionName => {
      const option = parseValidatorOption(
        options[optionName],
        optionName === "enum"
      );
      const validator = schema.validators[optionName];

      if (typeof validator === "function") {
        const result = validator(
          value,
          option,
          paramPath,
          options,
          parsed,
          schema
        );
        const { valid, message, isSchema } = result;
        const args = [
          paramPath,
          value,
          optionName,
          option.optionValue,
          message
        ];
        const errorObject = createErrorObject(...args);

        if (!valid) {
          errors.push(errorObject);
        } else if (typeof valid.catch === "function") {
          const promise = valid.catch(schemaErrors => {
            if (isSchema) {
              return errors.push(...toArray(schemaErrors));
            }
            return Promise.reject(errorObject);
          });
          promises.push(promise);
        }
      } else if (validator) {
        throw new Error(`[schm] ${paramName} validator must be a function`);
      }
    });
  };

  mapValues(parsed, schema.params, transformValue, toArray(paramPathPrefix));

  return Promise.all(promises).then(
    () => {
      if (errors.length) {
        return Promise.reject(errors);
      }
      return parsed;
    },
    e => {
      const allErrors = [].concat(errors, toArray(e));
      return Promise.reject(allErrors);
    }
  );
};

export default validate;
