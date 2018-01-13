import schema from '../src/schema'
import parse from '../src/parse'

it('throws when parser is not a function', () => {
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
  expect(() => parse(schm, { foo: 'foo' })).toThrow()
})

test('no schema', () => {
  expect(parse(schema(), { foo: 2 })).toEqual({})
})

test('type', () => {
  expect(parse(schema({ foo: String }), { foo: 2 })).toEqual({ foo: '2' })

  expect(parse(schema({ foo: { type: String } }), { foo: 2 })).toEqual({ foo: '2' })
})

test('set', () => {
  expect(parse(
    schema({ foo: { type: String, set: value => `${value}!!` } }),
    { foo: 'bar' }
  )).toEqual({ foo: 'bar!!' })
})

test('get', () => {
  expect(parse(
    schema({ foo: { type: String, get: value => `${value}!!` } }),
    { foo: 'bar' }
  )).toEqual({ foo: 'bar!!' })
})

test('lowercase', () => {
  expect(parse(
    schema({ foo: { type: String, lowercase: true } }),
    { foo: 'FOO' }
  )).toEqual({ foo: 'foo' })

  expect(parse(schema({ foo: { type: String, default: 'FOO', lowercase: true } }))).toEqual({ foo: 'foo' })
})

test('uppercase', () => {
  expect(parse(
    schema({ foo: { type: String, uppercase: true } }),
    { foo: 'foo' }
  )).toEqual({ foo: 'FOO' })

  expect(parse(schema({ foo: { type: String, default: 'foo', uppercase: true } }))).toEqual({ foo: 'FOO' })
})

test('trim', () => {
  expect(parse(
    schema({ foo: { type: String, trim: true } }),
    { foo: '  bar ' }
  )).toEqual({ foo: 'bar' })

  expect(parse(schema({ foo: { type: String, default: '  bar   ', trim: true } }))).toEqual({ foo: 'bar' })
})

test('default', () => {
  expect(parse(schema({ foo: 'bar' }))).toEqual({ foo: 'bar' })

  expect(parse(schema({ foo: 'bar' }), { foo: 2 })).toEqual({ foo: '2' })

  expect(parse(schema({ foo: { type: String, default: 'bar' } }))).toEqual({ foo: 'bar' })
})

describe('nested', () => {
  test('empty object', () => {
    expect(parse(schema({ foo: {} }), { foo: 2 })).toEqual({ foo: {} })
  })

  test('object with type properties', () => {
    expect(parse(
      schema({ foo: { bar: String, baz: Number } }),
      { foo: { bar: 1, baz: '2' } }
    )).toEqual({ foo: { bar: '1', baz: 2 } })
  })

  test('object with type', () => {
    expect(parse(
      schema({ foo: { type: Object, bar: String } }),
      { foo: { bar: 1 } }
    )).toEqual({ foo: { bar: 1 } })
  })

  test('nested array of object', () => {
    expect(parse(
      schema({ foo: [{ bar: String, baz: Number }] }),
      { foo: [{ bar: 1, baz: '2' }, { bar: '1', baz: 2 }] }
    )).toEqual({ foo: [{ bar: '1', baz: 2 }, { bar: '1', baz: 2 }] })
  })

  test('extremely nested', () => {
    const obj = qux => ({ foo: { bar: [{ baz: { qux } }] } })
    expect(parse(schema(obj(String)), obj(1))).toEqual(obj('1'))
  })
})
