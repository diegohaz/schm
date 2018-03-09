import schema from '../../schm/src'
import translate from '../../schm-translate/src'
import cursor from '../src/cursor'

test('page', () => {
  const schm = schema(cursor())
  const values = { page: 2 }
  expect(schm.parse(values)).toEqual({
    cursor: {
      limit: 20,
      skip: 20,
    },
  })
})

test('sort', () => {
  const schm = schema(cursor())
  const values = { sort: 'name' }
  expect(schm.parse(values)).toEqual({
    cursor: {
      limit: 20,
      skip: 0,
      sort: { name: 1 },
    },
  })
})

test('multiple sort array', () => {
  const schm = schema(cursor())
  const values = { sort: ['name', '-createdAt'] }
  expect(schm.parse(values)).toEqual({
    cursor: {
      limit: 20,
      skip: 0,
      sort: { name: 1, createdAt: -1 },
    },
  })
})

test('multiple sort string', () => {
  const schm = schema(cursor())
  const values = { sort: 'name, -createdAt' }
  expect(schm.parse(values)).toEqual({
    cursor: {
      limit: 20,
      skip: 0,
      sort: { name: 1, createdAt: -1 },
    },
  })
})

test('default params', () => {
  const schm = schema(
    {
      page: 2,
      limit: 50,
      sort: '-createdAt',
    },
    cursor(),
  )
  const values = {}
  expect(schm.parse(values)).toEqual({
    cursor: {
      limit: 50,
      skip: 50,
      sort: { createdAt: -1 },
    },
  })
})

test('translate', () => {
  const schm = schema(
    cursor(),
    translate({ page: 'p', limit: 'size', sort: 'order' }),
  )
  const values = { p: 2, size: 30, order: 'createdAt' }
  expect(schm.parse(values)).toEqual({
    cursor: {
      limit: 30,
      skip: 30,
      sort: { createdAt: 1 },
    },
  })
})
