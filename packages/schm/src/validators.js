// @flow
import type { Validator } from ".";
import { isArray, isSchema, parseValidatorOption } from "./utils";

export const validate: Validator = (
  value,
  option,
  paramPath,
  options,
  values,
  schema
) => {
  const { optionValue, message } = option;
  if (isArray(optionValue)) {
    return optionValue.reduce(
      (response, currentOption) =>
        !response.valid
          ? response
          : validate(
              value,
              parseValidatorOption(currentOption),
              paramPath,
              options,
              values,
              schema
            ),
      { valid: true }
    );
  }
  if (typeof optionValue !== "function") {
    throw new Error("[schm] validate must be a function");
  }
  return {
    valid: optionValue(value, paramPath, options, values, schema),
    message
  };
};

export const type: Validator = (value, option, paramPath) => {
  const { optionValue } = option;
  if (isSchema(optionValue)) {
    return { valid: optionValue.validate(value, paramPath), isSchema: true };
  }
  return { valid: true };
};

export const required: Validator = (value, option) => {
  const { optionValue, message } = option;
  const valid = optionValue
    ? value != null && value !== "" && !Number.isNaN(value)
    : true;
  return {
    valid,
    message: message || "{PARAM} is required"
  };
};

export const match: Validator = (value, option) => {
  const { optionValue, message } = option;
  if (!(optionValue instanceof RegExp)) {
    throw new Error("[schm] match must be a regex");
  }
  return {
    valid: !value || optionValue.test(value),
    message: message || "{PARAM} does not match"
  };
};

export const enumValidator: Validator = (value, option) => {
  const { optionValue, message } = option;
  if (!isArray(optionValue)) {
    throw new Error("[schm] enum must be an array");
  }
  return {
    valid: optionValue.indexOf(value) >= 0,
    message:
      message ||
      `{PARAM} must be one of the following: ${optionValue.join(", ")}`
  };
};

export const max: Validator = (value, option) => {
  const { optionValue, message } = option;
  return {
    valid: typeof value === "undefined" || value <= optionValue,
    message: message || `{PARAM} must be lower than or equal ${optionValue}`
  };
};

export const min: Validator = (value, option) => {
  const { optionValue, message } = option;
  return {
    valid: typeof value === "undefined" || value >= optionValue,
    message: message || `{PARAM} must be greater than or equal ${optionValue}`
  };
};

export const maxlength: Validator = (value, option) => {
  const { optionValue, message } = option;
  return {
    valid: typeof value === "undefined" || value.length <= optionValue,
    message:
      message || `{PARAM} length must be lower than or equal ${optionValue}`
  };
};

export const minlength: Validator = (value, option) => {
  const { optionValue, message } = option;
  return {
    valid: typeof value === "undefined" || value.length >= optionValue,
    message:
      message || `{PARAM} length must be greater than or equal ${optionValue}`
  };
};

export default {
  type,
  required,
  match,
  enum: enumValidator,
  max,
  min,
  maxlength,
  minlength,
  validate
};
