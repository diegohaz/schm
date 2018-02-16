import schema from '../../schm/src'
import computed from '../src'

describe('computed', () => {
  it('works', () => {
    const schm = schema(
      {
        firstName: String,
        lastName: String,
      },
      computed({
        fullName: values => `${values.firstName} ${values.lastName}`,
      }),
    )

    expect(
      schm.parse({
        firstName: 'Diego',
        lastName: 'Haz',
      }),
    ).toEqual({
      firstName: 'Diego',
      lastName: 'Haz',
      fullName: 'Diego Haz',
    })
  })

  it('throws', () => {
    const schm = schema(
      {
        firstName: String,
        lastName: String,
      },
      computed({
        fullName: 'foo',
      }),
    )

    expect(() =>
      schm.parse({
        firstName: 'Diego',
        lastName: 'Haz',
      }),
    ).toThrow()
  })
})
