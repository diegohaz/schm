import parsePaths from '../src/parsePaths'

test('single path', () => {
  const values = {
    foo: { $in: ['qux', 'quux'] },
  }
  const pathsMap = {
    foo: ['bar'],
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    bar: { $in: ['qux', 'quux'] },
  })
})

test('multiple paths', () => {
  const values = {
    foo: { $in: ['qux', 'quux'] },
  }
  const pathsMap = {
    foo: ['bar', 'baz'],
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    $or: [{ bar: { $in: ['qux', 'quux'] } }, { baz: { $in: ['qux', 'quux'] } }],
  })
})
