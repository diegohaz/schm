import schema from '../../schm/src'
import { query } from '../src'

describe('query', () => {
  test('query', () => {
    const schm = schema(
      {
        title: String,
        description: String,
        date: Date,
      },
      query({
        after: {
          type: Date,
          paths: ['date'],
          operator: '$gte',
        },
      }),
    )
    console.log(
      schm.parse({ title: 'lol', date: '2018-01-01', after: '2018-01-01' }),
    )
  })
})
