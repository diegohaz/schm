import schema from '../src/schema'
import validate from '../src/validate'

describe('validate', () => {
  it('fails with function', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => false,
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
  })

  it('fails with promise', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => Promise.reject(),
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
  })

  it('fails with function and message array', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [() => false, '{VALUE} is wrong!'],
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
  })

  it('fails with function and message object', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: {
          validator: () => false,
          message: '{VALUE} is wrong!',
        },
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
  })

  it('fails with promise and message array', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [() => Promise.reject(), '{VALUE} is wrong!'],
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
  })

  it('fails with promise and message object', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: {
          validator: () => Promise.reject(),
          message: '{VALUE} is wrong!',
        },
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
  })

  it('fails with nested param', async () => {
    const schm = schema({
      foo: {
        bar: [{
          type: String,
          validate: v => v !== 'wrong',
        }],
      },
    })
    await expect(validate(schm, { foo: { bar: ['right', 'wrong'] } })).rejects.toMatchSnapshot()
  })

  it('fails with multiple function validators', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [
          v => v !== 'wrong',
          v => v !== 'notright',
        ],
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
    await expect(validate(schm, { foo: 'notright' })).rejects.toMatchSnapshot()
  })

  it('fails with multiple array validators', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [
          [v => v !== 'wrong', '{VALUE} is wrong!'],
          [v => v !== 'notright', '{VALUE} is notright!'],
        ],
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
    await expect(validate(schm, { foo: 'notright' })).rejects.toMatchSnapshot()
  })

  it('fails with multiple object validators', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [
          { validator: v => v !== 'wrong', message: '{VALUE} is wrong!' },
          { validator: v => v !== 'notright', message: '{VALUE} is notright!' },
        ],
      },
    })
    await expect(validate(schm, { foo: 'wrong' })).rejects.toMatchSnapshot()
    await expect(validate(schm, { foo: 'notright' })).rejects.toMatchSnapshot()
  })

  it('fails with multiple params', async () => {
    const schm = schema({
      foo: { type: String, validate: () => false },
      bar: { type: String, validate: () => false },
    })
    await expect(validate(schm, { foo: 'wrong', bar: 'wrong' })).rejects.toMatchSnapshot()
  })

  it('passes with function', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => true,
      },
    })
    await expect(validate(schm, { foo: 'right' })).resolves.toMatchSnapshot()
  })

  it('passes with promise', async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => Promise.resolve(),
      },
    })
    await expect(validate(schm, { foo: 'right' })).resolves.toMatchSnapshot()
  })

  it('throws if value is not a function', () => {
    const schm = schema({
      foo: {
        type: String,
        validate: 'foo',
      },
    })
    expect(() => validate(schm, { foo: 'right' })).toThrow()
  })
})

describe('required', () => {
  it('fails with value', async () => {
    const schm = schema({
      foo: {
        type: String,
        required: true,
      },
    })
    await expect(validate(schm)).rejects.toMatchSnapshot()
  })

  it('fails with value and message array', async () => {
    const schm = schema({
      foo: {
        type: String,
        required: [true, 'foo'],
      },
    })
    await expect(validate(schm)).rejects.toMatchSnapshot()
  })

  it('passes', async () => {
    const schm = schema({
      foo: {
        type: String,
        required: true,
      },
    })
    await expect(validate(schm, { foo: 'foo' })).resolves.toMatchSnapshot()
  })
})

describe('match', () => {
  it('fails with value', async () => {
    const schm = schema({
      foo: {
        type: String,
        match: /foo/,
      },
    })
    await expect(validate(schm, { foo: 'bar' })).rejects.toMatchSnapshot()
  })

  it('fails with value and message array', async () => {
    const schm = schema({
      foo: {
        type: String,
        match: [/foo/, 'foo'],
      },
    })
    await expect(validate(schm, { foo: 'bar' })).rejects.toMatchSnapshot()
  })

  it('passes', async () => {
    const schm = schema({
      foo: {
        type: String,
        match: /foo/,
      },
    })
    await expect(validate(schm, { foo: 'foo' })).resolves.toMatchSnapshot()
  })

  it('throws if value is not a regex', () => {
    const schm = schema({
      foo: {
        type: String,
        match: 'foo',
      },
    })
    expect(() => validate(schm, { foo: 'foo' })).toThrow()
  })
})

describe('enum', () => {
  it('fails with value', async () => {
    const schm = schema({
      foo: {
        type: String,
        enum: ['foo', 'bar'],
      },
    })
    await expect(validate(schm, { foo: 'baz' })).rejects.toMatchSnapshot()
  })

  it('fails with value and message object', async () => {
    const schm = schema({
      foo: {
        type: String,
        enum: { values: ['foo', 'bar'], message: 'foo' },
      },
    })
    await expect(validate(schm, { foo: 'baz' })).rejects.toMatchSnapshot()
  })

  it('passes', async () => {
    const schm = schema({
      foo: {
        type: String,
        enum: ['foo', 'bar'],
      },
    })
    await expect(validate(schm, { foo: 'foo' })).resolves.toMatchSnapshot()
  })

  it('throws if value is not an array', () => {
    const schm = schema({
      foo: {
        type: String,
        enum: 'foo',
      },
    })
    expect(() => validate(schm, { foo: 'foo' })).toThrow()
  })
})

describe('max', () => {
  it('fails with value', async () => {
    const schm = schema({
      foo: {
        type: Number,
        max: 1,
      },
    })
    await expect(validate(schm, { foo: 2 })).rejects.toMatchSnapshot()
  })

  it('fails with value and message array', async () => {
    const schm = schema({
      foo: {
        type: Number,
        max: [1, 'foo'],
      },
    })
    await expect(validate(schm, { foo: 2 })).rejects.toMatchSnapshot()
  })

  it('passes', async () => {
    const schm = schema({
      foo: {
        type: Number,
        max: 1,
      },
    })
    await expect(validate(schm, { foo: 1 })).resolves.toMatchSnapshot()
  })
})

describe('min', () => {
  it('fails with value', async () => {
    const schm = schema({
      foo: {
        type: Number,
        min: 2,
      },
    })
    await expect(validate(schm, { foo: 1 })).rejects.toMatchSnapshot()
  })

  it('fails with value and message array', async () => {
    const schm = schema({
      foo: {
        type: Number,
        min: [2, 'foo'],
      },
    })
    await expect(validate(schm, { foo: 1 })).rejects.toMatchSnapshot()
  })

  it('passes', async () => {
    const schm = schema({
      foo: {
        type: Number,
        min: 2,
      },
    })
    await expect(validate(schm, { foo: 2 })).resolves.toMatchSnapshot()
  })
})

describe('maxlength', () => {
  it('fails with value', async () => {
    const schm = schema({
      foo: {
        type: String,
        maxlength: 1,
      },
    })
    await expect(validate(schm, { foo: '12' })).rejects.toMatchSnapshot()
  })

  it('fails with value and message array', async () => {
    const schm = schema({
      foo: {
        type: String,
        maxlength: [1, 'foo'],
      },
    })
    await expect(validate(schm, { foo: '12' })).rejects.toMatchSnapshot()
  })

  it('passes', async () => {
    const schm = schema({
      foo: {
        type: String,
        maxlength: 1,
      },
    })
    await expect(validate(schm, { foo: '1' })).resolves.toMatchSnapshot()
  })
})

describe('minlength', () => {
  it('fails with value', async () => {
    const schm = schema({
      foo: {
        type: String,
        minlength: 2,
      },
    })
    await expect(validate(schm, { foo: '1' })).rejects.toMatchSnapshot()
  })

  it('fails with value and message array', async () => {
    const schm = schema({
      foo: {
        type: String,
        minlength: [2, 'foo'],
      },
    })
    await expect(validate(schm, { foo: '1' })).rejects.toMatchSnapshot()
  })

  it('passes', async () => {
    const schm = schema({
      foo: {
        type: String,
        minlength: 2,
      },
    })
    await expect(validate(schm, { foo: '12' })).resolves.toMatchSnapshot()
  })
})

test('validator must be a function', () => {
  const schm = schema({
    foo: {
      type: String,
      bar: 'baz',
    },
  }, previous => previous.merge({
    validators: {
      bar: true,
    },
  }))
  expect(() => validate(schm, {})).toThrow()
})
