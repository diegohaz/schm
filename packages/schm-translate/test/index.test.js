import schema from '../../schm/src'
import translate from '../src'

test('translate', () => {
  const schm = schema({
    name: String,
  }, translate({
    name: 'foo.bar',
  }))

  expect(
    schm.parse({ foo: { bar: 'John' } })
  ).toEqual({ name: 'John' })
})
