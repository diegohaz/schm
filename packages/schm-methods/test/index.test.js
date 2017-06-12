import schema from '../../schm/src'
import methods from '../src'

describe('methods', () => {
  it('works', () => {
    const schm = schema({
      name: String,
    }, methods({
      getName(values, prefix) {
        return prefix + this.name
      },
      getName2: (values, prefix) => prefix + values.name,
    }))

    expect(
      schm.parse({ name: 'John' }).getName('Mr. ')
    ).toEqual('Mr. John')
    expect(
      schm.parse({ name: 'John' }).getName2('Mr. ')
    ).toEqual('Mr. John')
  })

  it('throws', () => {
    const schm = schema({
      name: String,
    }, methods({
      foo: 'bar',
    }))

    expect(() => schm.parse({ name: 'John' })).toThrow()
  })
})
