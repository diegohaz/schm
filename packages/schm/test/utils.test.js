import schema from '../src'
import { isSchema, mapValuesToSchema } from '../src/utils'

test('isSchema', () => {
  expect(isSchema({})).toBe(false)
  expect(isSchema(schema())).toBe(true)
})

test('mapValuesToSchema', () => {
  const schm = schema({
    foo: String,
    bar: {
      baz: [{
        qux: [{
          type: String,
        }],
      }],
    },
  })
  const values = {
    foo: 'foo',
    bar: {
      baz: [
        { qux: ['1', '2'] },
        { qux: '3' },
      ],
    },
  }
  const fn = jest.fn((value, options, paramName, paramPath) => ({
    paramName,
    options,
    value,
    paramPath,
  }))
  expect(mapValuesToSchema(values, schm, fn)).toEqual({
    foo: {
      paramName: 'foo',
      options: {
        type: String,
      },
      value: 'foo',
      paramPath: 'foo',
    },
    bar: {
      baz: [{
        qux: [{
          paramName: 'qux',
          options: { type: String },
          value: '1',
          paramPath: 'bar.baz.0.qux.0',
        }, {
          paramName: 'qux',
          options: { type: String },
          value: '2',
          paramPath: 'bar.baz.0.qux.1',
        }],
      }, {
        qux: [{
          paramName: 'qux',
          options: { type: String },
          value: '3',
          paramPath: 'bar.baz.1.qux.0',
        }],
      }],
    },
  })
})
