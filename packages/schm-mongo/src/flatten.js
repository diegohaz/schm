// @flow

const flatten = (object: Object, keys: string[] = []): Object =>
  Object.keys(object).reduce((finalObject, key) => {
    if (key.indexOf('$') === 0) {
      const value = { [key]: object[key] }
      return {
        ...finalObject,
        ...(keys.length ? { [keys.join('.')]: value } : value),
      }
    }

    const value = Array.isArray(object[key]) ? object[key][0] : object[key]
    const allKeys = [...keys, key]

    if (typeof value === 'object') {
      return {
        ...finalObject,
        ...flatten(value, allKeys),
      }
    }

    return {
      ...finalObject,
      [allKeys.join('.')]: value,
    }
  }, {})

export default flatten
