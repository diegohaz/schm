// @flow
import { toArray, isArray, isSchema } from "./utils";

type TransformValueFunction = (
  value: any,
  options: Object,
  paramName: string,
  paramPath: string
) => any;

type MapValuesFunction = (
  values: Object,
  params: Object,
  transformValueFn: TransformValueFunction,
  paramNames?: any[]
) => Object;

const mapValues: MapValuesFunction = (
  values,
  params,
  transformValueFn,
  paramNames = []
) =>
  Object.keys(params).reduce((finalParams, paramName) => {
    const options = params[paramName];
    const value = values[paramName];
    const paramPath = [...paramNames, paramName].join(".");
    const mergeParam = finalValue => ({
      ...finalParams,
      [paramName]: finalValue
    });

    if (isArray(options.type)) {
      const [opt] = options.type;
      const finalValue = toArray(value).map((val, i) =>
        transformValueFn(val, opt, paramName, [paramPath, i].join("."))
      );
      return mergeParam(finalValue);
    }

    if (isSchema(options.type)) {
      return mergeParam(
        mapValues(value, options.type.params, transformValueFn, [paramPath])
      );
    }

    return mergeParam(transformValueFn(value, options, paramName, paramPath));
  }, {});

export default mapValues;
