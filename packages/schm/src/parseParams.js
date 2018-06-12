// @flow
import { isArray, isSchema, isFunction, isObject } from "./utils";
import { defaultSchema } from "./schema";

const hasType = (options: any): boolean => isObject(options) && options.type;

const literalType = (options: any): Object => {
  if (isFunction(options) || isSchema(options)) {
    return { type: options };
  }
  return options;
};

const defaultValue = (options: any): Object => {
  if (!isObject(options) && !isFunction(options)) {
    return { type: options.constructor, default: options };
  }
  return options;
};

const nestedObject = (options: any): Object => {
  if (!isSchema(options) && isObject(options) && !hasType(options)) {
    return { type: defaultSchema(options) };
  }
  return options;
};

const parseOptions = (options: any = String): Object => {
  if (isArray(options)) {
    return { type: [parseOptions(options[0])] };
  }
  if (hasType(options) && isArray(options.type)) {
    return { type: [parseOptions(options.type[0])] };
  }

  const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
  const flow = compose(
    literalType,
    defaultValue,
    nestedObject
  );
  return flow(options);
};

const parseParams = (params: Object): Object =>
  Object.keys(params).reduce(
    (finalParams, paramName) => ({
      ...finalParams,
      [paramName]: parseOptions(params[paramName])
    }),
    {}
  );

export default parseParams;
