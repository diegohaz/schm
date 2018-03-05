import parsePaths from '../src/parsePaths'

test('single path', () => {
  const values = {
    foo: { $in: ['qux', 'quux'] },
  }
  const params = {
    foo: {
      type: [String],
      paths: ['bar'],
      operator: '$in',
    },
  }
  expect(parsePaths(values, params)).toEqual({
    bar: { $in: ['qux', 'quux'] },
  })
})

test('multiple paths', () => {
  const values = {
    foo: { $in: ['qux', 'quux'] },
  }
  const params = {
    foo: {
      type: [String],
      paths: ['bar', 'baz'],
      operator: '$in',
    },
  }
  expect(parsePaths(values, params)).toEqual({
    $or: [{ bar: { $in: ['qux', 'quux'] } }, { baz: { $in: ['qux', 'quux'] } }],
  })
})
