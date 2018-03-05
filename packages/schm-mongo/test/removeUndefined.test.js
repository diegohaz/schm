import removeUndefined from '../src/removeUndefined'

test('removeUndefined', () => {
  const object = {
    foo: 'foo',
    bar: undefined,
  }
  expect(removeUndefined(object)).toEqual({ foo: 'foo' })
})
