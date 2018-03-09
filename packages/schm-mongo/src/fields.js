const fields = () => previous =>
  previous.merge({
    params: {
      fields: {
        type: String,
        set: value => {
          if (!value) return value
          return value
            .split(',')
            .map(v => v.trim())
            .map(v => ({
              [v.replace(/^[+-]/, '')]: v.indexOf('-') === 0 ? 0 : 1,
            }))
            .reduce((finalObject, currentObject) => ({
              ...finalObject,
              ...currentObject,
            }))
        },
      },
    },
  })

export default fields
