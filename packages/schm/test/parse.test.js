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
  expect(() => parse({ foo: 'foo' }, schm)).toThrow()
})

test('no schema', () => {
  expect(parse({ foo: 2 }, schema())).toEqual({})
})

test('type', () => {
  expect(parse({ foo: 2 }, schema({ foo: String }))).toEqual({ foo: '2' })
  expect(parse({ foo: 2 }, schema({ foo: { type: String } }))).toEqual({ foo: '2' })
})

test('set', () => {
  expect(parse(
    { foo: 'bar' },
    schema({ foo: { type: String, set: value => `${value}!!` } }),
  )).toEqual({ foo: 'bar!!' })
})

test('get', () => {
  expect(parse(
    { foo: 'bar' },
    schema({ foo: { type: String, get: value => `${value}!!` } }),
  )).toEqual({ foo: 'bar!!' })
})

test('lowercase', () => {
  expect(parse(
    { foo: 'FOO' },
    schema({ foo: { type: String, lowercase: true } }),
  )).toEqual({ foo: 'foo' })

  expect(parse(undefined, schema({ foo: { type: String, default: 'FOO', lowercase: true } }))).toEqual({ foo: 'foo' })
})

test('uppercase', () => {
  expect(parse(
    { foo: 'foo' },
    schema({ foo: { type: String, uppercase: true } }),
  )).toEqual({ foo: 'FOO' })

  expect(parse(undefined, schema({ foo: { type: String, default: 'foo', uppercase: true } }))).toEqual({ foo: 'FOO' })
})

test('trim', () => {
  expect(parse(
    { foo: '  bar ' },
    schema({ foo: { type: String, trim: true } }),
  )).toEqual({ foo: 'bar' })

  expect(parse(undefined, schema({ foo: { type: String, default: '  bar   ', trim: true } }))).toEqual({ foo: 'bar' })
})

test('default', () => {
  expect(parse(undefined, schema({ foo: 'bar' }))).toEqual({ foo: 'bar' })
  expect(parse({ foo: 2 }, schema({ foo: 'bar' }))).toEqual({ foo: '2' })
  expect(parse(undefined, schema({ foo: { type: String, default: 'bar' } }))).toEqual({ foo: 'bar' })
})

describe('nested', () => {
  test('empty object', () => {
    expect(parse({ foo: 2 }, schema({ foo: {} }))).toEqual({ foo: {} })
  })

  test('object with type properties', () => {
    expect(parse(
      { foo: { bar: 1, baz: '2' } },
      schema({ foo: { bar: String, baz: Number } }),
    )).toEqual({ foo: { bar: '1', baz: 2 } })
  })

  test('object with type', () => {
    expect(parse(
      { foo: { bar: 1 } },
      schema({ foo: { type: Object, bar: String } }),
    )).toEqual({ foo: { bar: 1 } })
  })

  test('nested array of object', () => {
    expect(parse(
      { foo: [{ bar: 1, baz: '2' }, { bar: '1', baz: 2 }] },
      schema({ foo: [{ bar: String, baz: Number }] }),
    )).toEqual({ foo: [{ bar: '1', baz: 2 }, { bar: '1', baz: 2 }] })
  })

  test('extremely nested', () => {
    const obj = qux => ({ foo: { bar: [{ baz: { qux } }] } })
    expect(parse(obj(1), schema(obj(String)))).toEqual(obj('1'))
  })
})
