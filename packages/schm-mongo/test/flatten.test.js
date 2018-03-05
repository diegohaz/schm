import flatten from '../src/flatten'

test('flatten', () => {
  const object = {
    foo: {
      bar: {
        baz: 1,
      },
    },
    foo2: [
      {
        bar2: [
          {
            $baz2: 1,
          },
        ],
      },
    ],
    $foo3: [
      {
        bar3: 1,
      },
    ],
  }
  expect(flatten(object)).toEqual({
    'foo.bar.baz': 1,
    'foo2.bar2': { $baz2: 1 },
    $foo3: [{ bar3: 1 }],
  })
})
