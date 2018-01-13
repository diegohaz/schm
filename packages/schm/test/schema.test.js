import schema from '../src/schema'

test('parse', () => {
  const schm = schema({ foo: String })
  expect(schm.parse({ foo: 1 })).toEqual({ foo: '1' })
})

test('validate', async () => {
  const schm = schema({
    foo: {
      type: String,
      required: true,
    },
  })
  await expect(schm.validate()).rejects.toMatchSnapshot()
})

describe('composition', () => {
  it('composes schema group', () => {
    const foo = params => previous => previous.merge({
      params,
      parsers: {
        foo: (value, option) => `${value}${option}`,
      },
    })

    const bar = params => previous => previous.merge({
      params: Object.keys(params).reduce((finalParams, name) => ({
        ...finalParams,
        [name]: {
          bar: params[name],
        },
      }), {}),
      parsers: {
        bar: (value, option) => `${value}${option}`,
      },
    })

    expect(schema(
      {
        name: String,
      },
      foo({
        name: {
          foo: 'foo',
        },
      }),
      bar({
        name: 'bar',
      })
    ).parse({ name: 'test' })).toEqual({ name: 'testfoobar' })
  })

  it('composes schema', () => {
    const schema1 = schema({ age: Number })
    const schema2 = schema(schema1, { name: String })
    expect(schema2.parse({ name: 'Haz', age: '27' })).toEqual({
      name: 'Haz',
      age: 27,
    })
  })
})
