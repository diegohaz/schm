import schema from '../../schm/src'
import translate from '../../schm-translate/src'
import near from '../src/near'

test('default', () => {
  const schm = schema(near('loc'))
  const values = {
    near: '10,20',
  }
  expect(schm.parse(values)).toEqual({
    loc: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [10, 20],
        },
      },
    },
  })
})
