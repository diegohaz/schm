import schema from '../src'

describe('parse', () => {
  it('throws', () => {
    const schm = schema(previous => previous.merge({
      params: {
        foo: {
          type: String,
          bar: 'baz',
        },
      },
      parsers: {
        bar: 'notfunction',
      },
    }))
    expect(() => schm.parse({ foo: 'foo' })).toThrow()
  })

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

  test('lowercase', () => {
    expect(
      schema({
        foo: { type: String, lowercase: true },
      }).parse({ foo: 'FOO' })
    ).toEqual({ foo: 'foo' })

    expect(
      schema({
        foo: { type: String, default: 'FOO', lowercase: true },
      }).parse()
    ).toEqual({ foo: 'foo' })
  })

  test('uppercase', () => {
    expect(
      schema({
        foo: { type: String, uppercase: true },
      }).parse({ foo: 'foo' })
    ).toEqual({ foo: 'FOO' })

    expect(
      schema({
        foo: { type: String, default: 'foo', uppercase: true },
      }).parse()
    ).toEqual({ foo: 'FOO' })
  })

  test('trim', () => {
    expect(
      schema({
        foo: { type: String, trim: true },
      }).parse({ foo: '  bar ' })
    ).toEqual({ foo: 'bar' })

    expect(
      schema({
        foo: { type: String, default: '  bar   ', trim: true },
      }).parse()
    ).toEqual({ foo: 'bar' })
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

describe('validate', () => {
  it('fails when validating validate option', async () => {
    const validate = jest.fn(val => val !== 'test')
    await expect(
      schema({ foo: { bar: { type: String, validate } } }).validate({ foo: { bar: 'test' } })
    ).rejects.toBeTruthy()
  })

  test('required', async () => {
    await expect(
      schema({
        foo: {
          type: String,
          required: true
        }
      }).validate()
    ).rejects.toBeTruthy()
  })
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

  it('composes schema', () => {
    const schema1 = schema({ age: Number })
    const schema2 = schema(schema1, { name: String })
    expect(
      schema2.parse({ name: 'Haz', age: '27' })
    ).toEqual({
      name: 'Haz',
      age: 27,
    })
  })
})
