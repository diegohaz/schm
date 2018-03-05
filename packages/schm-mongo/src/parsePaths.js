// @flow
import get from 'lodash/get'
import omit from 'lodash/omit'

const parsePaths = (values: Object, params: Object): Object =>
  Object.keys(values).reduce((finalObject, key) => {
    const { paths } = get(params, key)
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
