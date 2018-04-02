// @flow

const removeUndefined = (object: Object): Object =>
  Object.keys(object).reduce((finalObject, key) => {
    if (typeof object[key] === "undefined") {
      return finalObject;
    }
    return {
      ...finalObject,
      [key]: object[key]
    };
  }, {});

export default removeUndefined;
