// @flow
import omit from "lodash/omit";
import type { PathsMap } from ".";

const getPathValuesFromObject = (object: Object, path: string) => {
  if (object[path]) {
    return [object[path]];
  }
  if (object.$and) {
    return object.$and.reduce(
      (finalValues, currentObject) =>
        [].concat(finalValues, getPathValuesFromObject(currentObject, path)),
      []
    );
  }
  return [];
};

const removePathsFromObject = (object: Object, paths: string[]): Object => {
  const finalObject = omit(object, paths);
  const removeFromArray = array =>
    array
      .reduce(
        (finalArray, currentObject) => [
          ...finalArray,
          removePathsFromObject(currentObject, paths)
        ],
        []
      )
      .filter(x => Object.keys(x).length);

  if (finalObject.$and) {
    return {
      ...finalObject,
      $and: removeFromArray(finalObject.$and)
    };
  }
  return finalObject;
};

const parsePaths = (values: Object, pathsMap: PathsMap): Object =>
  Object.keys(values).reduce((finalObject, key) => {
    const paths = [].concat(pathsMap[key] || []);

    if (!paths.length) {
      return finalObject;
    }

    const existingPathsValues = [].concat(
      ...paths.map(path => {
        const pathValues = getPathValuesFromObject(finalObject, path);
        if (pathValues.length) {
          return pathValues.map(val => ({ [path]: val }));
        }
        return [];
      })
    );

    const value = paths.map(path => ({ [path]: values[key] }));
    const finalValue = value.length === 1 ? value[0] : { $or: value };
    const normalizedObject = removePathsFromObject(finalObject, [
      key,
      ...paths
    ]);

    if (existingPathsValues.length) {
      return {
        $and: [].concat(
          normalizedObject.$and ||
            (Object.keys(normalizedObject).length ? normalizedObject : []),
          existingPathsValues,
          finalValue
        )
      };
    }

    return {
      ...normalizedObject,
      ...finalValue
    };
  }, values);

export default parsePaths;
