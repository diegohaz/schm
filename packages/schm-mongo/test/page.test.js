import schema from '../../schm/src'
import translate from '../../schm-translate/src'
import page from '../src/page'

test('page', () => {
  const schm = schema(page())
  const values = { page: 2 }
  expect(schm.parse(values)).toEqual({
    page: {
      limit: 20,
      skip: 20,
    },
  })
})

test('sort', () => {
  const schm = schema(page())
  const values = { sort: 'name' }
  expect(schm.parse(values)).toEqual({
    page: {
      limit: 20,
      skip: 0,
      sort: { name: 1 },
    },
  })
})

test('multiple sort array', () => {
  const schm = schema(page())
  const values = { sort: ['name', '-createdAt'] }
  expect(schm.parse(values)).toEqual({
    page: {
      limit: 20,
      skip: 0,
      sort: { name: 1, createdAt: -1 },
    },
  })
})

test('multiple sort string', () => {
  const schm = schema(page())
  const values = { sort: 'name, -createdAt' }
  expect(schm.parse(values)).toEqual({
    page: {
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
    page(),
  )
  const values = {}
  expect(schm.parse(values)).toEqual({
    page: {
      limit: 50,
      skip: 50,
      sort: { createdAt: -1 },
    },
  })
})

test('translate', () => {
  const schm = schema(
    page(),
    translate({ page: 'p', limit: 'size', sort: 'order' }),
  )
  const values = { p: 2, size: 30, order: 'createdAt' }
  expect(schm.parse(values)).toEqual({
    page: {
      limit: 30,
      skip: 30,
      sort: { createdAt: 1 },
    },
  })
})
