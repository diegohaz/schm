// @flow
import omit from 'lodash/omit'

const parsePaths = (values: Object, pathsMap: Object): Object =>
  Object.keys(values).reduce((finalObject, key) => {
    const paths = pathsMap[key]
    const value = values[key]

    if (!paths) {
      return finalObject
    }

    const innerObject = {
      $or: paths.map(path => ({
        [path]: value,
      })),
    }

    return {
      ...omit(finalObject, key),
      ...(paths.length === 1 ? innerObject.$or[0] : innerObject),
    }
  }, values)

export default parsePaths
