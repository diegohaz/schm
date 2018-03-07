import parsePaths from '../src/parsePaths'

test('single path', () => {
  const values = {
    foo: 'foo',
  }
  const pathsMap = {
    foo: 'bar',
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    bar: 'foo',
  })
})

test('multiple paths', () => {
  const values = {
    foo: 'foo',
  }
  const pathsMap = {
    foo: ['bar', 'baz'],
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    $or: [{ bar: 'foo' }, { baz: 'foo' }],
  })
})

test('existing path', () => {
  const values = {
    foo: 'foo',
    bar: 'bar',
  }
  const pathsMap = {
    bar: 'foo',
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    $and: [{ foo: 'foo' }, { foo: 'bar' }],
  })
})

test('colliding paths', () => {
  const values = {
    date: 'date',
    after: 'after',
    before: 'before',
  }
  const pathsMap = {
    after: 'date',
    before: 'date',
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    $and: [{ date: 'date' }, { date: 'after' }, { date: 'before' }],
  })
})

test('many paths without collision with $or', () => {
  const values = {
    term: 'term',
    after: 'after',
    before: 'before',
    end: 'end',
  }
  const pathsMap = {
    term: ['title', 'description'],
    after: 'date',
    before: 'date',
    end: 'date',
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    $and: [
      {
        $or: [{ title: 'term' }, { description: 'term' }],
      },
      { date: 'after' },
      { date: 'before' },
      { date: 'end' },
    ],
  })
})

test('many paths with collision with $or', () => {
  const values = {
    title: 'title',
    description: 'description',
    term: 'term',
    secondTerm: 'secondTerm',
    thirdTerm: 'thirdTerm',
  }
  const pathsMap = {
    term: ['title', 'description'],
    secondTerm: 'title',
    thirdTerm: 'description',
  }
  expect(parsePaths(values, pathsMap)).toEqual({
    $and: [
      {
        $or: [{ title: 'term' }, { description: 'term' }],
      },
      { title: 'title' },
      { title: 'secondTerm' },
      { description: 'description' },
      { description: 'thirdTerm' },
    ],
  })
})
