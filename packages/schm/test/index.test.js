import schema from '../src'

describe('parse', () => {
  test('no schema', () => {
    expect(
      schema().parse({ foo: 2 })
    ).toEqual({})
  })

  test('type', () => {
    expect(
      schema({ foo: String }).parse({ foo: 2 })
    ).toEqual({ foo: '2' })

    expect(
      schema({ foo: { type: String } }).parse({ foo: 2 })
    ).toEqual({ foo: '2' })
  })

  test('set', () => {
    expect(
      schema({
        foo: { type: String, set: value => `${value}!!` },
      }).parse({ foo: 'bar' })
    ).toEqual({ foo: 'bar!!' })
  })

  test('get', () => {
    expect(
      schema({
        foo: { type: String, get: value => `${value}!!` },
      }).parse({ foo: 'bar' })
    ).toEqual({ foo: 'bar!!' })
  })

  test('default', () => {
    expect(
      schema({ foo: 'bar' }).parse()
    ).toEqual({ foo: 'bar' })

    expect(
      schema({ foo: 'bar' }).parse({ foo: 2 })
    ).toEqual({ foo: '2' })

    expect(
      schema({ foo: { type: String, default: 'bar' } }).parse()
    ).toEqual({ foo: 'bar' })
  })

  describe('nested', () => {
    test('empty object', () => {
      expect(
        schema({ foo: {} }).parse({ foo: 2 })
      ).toEqual({ foo: {} })
    })

    test('object with type properties', () => {
      expect(
        schema({
          foo: { bar: String, baz: Number },
        }).parse({ foo: { bar: 1, baz: '2' } })
      ).toEqual({ foo: { bar: '1', baz: 2 } })
    })

    test('object with type', () => {
      expect(
        schema({
          foo: { type: Object, bar: String },
        }).parse({ foo: { bar: 1 } })
      ).toEqual({ foo: { bar: 1 } })
    })

    test('nested array of object', () => {
      expect(
        schema({
          foo: [{ bar: String, baz: Number }],
        }).parse({ foo: [{ bar: 1, baz: '2' }, { bar: '1', baz: 2 }] })
      ).toEqual({ foo: [{ bar: '1', baz: 2 }, { bar: '1', baz: 2 }] })
    })

    test('extremely nested', () => {
      const obj = qux => ({ foo: { bar: [{ baz: { qux } }] } })
      expect(schema(obj(String)).parse(obj(1))).toEqual(obj('1'))
    })
  })
})

test('composition', () => {
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

  expect(
    schema(
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
    ).parse({ name: 'test' })
  ).toEqual({ name: 'testfoobar' })
})

