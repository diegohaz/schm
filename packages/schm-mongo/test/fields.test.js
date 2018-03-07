import schema from '../../schm/src'
import translate from '../../schm-translate/src'
import fields from '../src/fields'

describe('fields', () => {
  test('default', () => {
    const schm = schema(fields())
    const values = {
      fields: ['foo', 'bar'],
    }
    expect(schm.parse(values)).toEqual({
      fields: {
        foo: 1,
        bar: 1,
      },
    })
  })

  test('without value', () => {
    const schm = schema(fields())
    const values = {}
    expect(schm.parse(values)).toEqual({})
  })

  test('translate', () => {
    const schm = schema(fields(), translate({ fields: 'select' }))
    const values = {
      select: ['foo', 'bar'],
    }
    expect(schm.parse(values)).toEqual({
      fields: {
        foo: 1,
        bar: 1,
      },
    })
  })

  test('nested', () => {
    const schm = schema(fields())
    const values = {
      fields: ['foo', 'bar.baz'],
    }
    expect(schm.parse(values)).toEqual({
      fields: {
        foo: 1,
        'bar.baz': 1,
      },
    })
  })

  test('exclude', () => {
    const schm = schema(fields())
    const values = {
      fields: ['-foo', 'bar'],
    }
    expect(schm.parse(values)).toEqual({
      fields: {
        foo: 0,
        bar: 1,
      },
    })
  })
})
