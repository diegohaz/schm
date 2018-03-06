import schema from '../../schm/src'
import query from '../src/query'

describe('query', () => {
  test('single path', () => {
    const schm = schema(
      {
        title: RegExp,
        date: Date,
        after: {
          type: Date,
          operator: '$gte',
        },
      },
      query({
        after: ['date'],
      }),
    )
    const values = {
      title: 'foo',
      after: '2018-01-01',
    }
    expect(schm.parse(values)).toEqual({
      title: /foo/i,
      date: { $gte: new Date('2018-01-01') },
    })
  })

  test('multiple paths', () => {
    const schm = schema(
      {
        title: String,
        description: String,
        term: RegExp,
      },
      query({
        term: ['title', 'description'],
      }),
    )
    const values = {
      term: 'foo',
    }
    expect(schm.parse(values)).toEqual({
      $or: [{ title: /foo/i }, { description: /foo/i }],
    })
  })
})
