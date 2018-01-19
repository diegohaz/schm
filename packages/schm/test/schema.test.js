import schema from '../src/schema'

test('parse', () => {
  const schm = schema({ foo: String })
  expect(schm.parse({ foo: 1 })).toEqual({ foo: '1' })
})

test('validate', async () => {
  const schm = schema({
    foo: {
      type: String,
      required: true,
    },
  })
  await expect(schm.validate()).rejects.toMatchSnapshot()
})

describe('composition', () => {
  it('composes schema group', () => {
    const foo = params => previous => previous.merge({
      params,
      parsers: {
        foo: (value, option) => `${value}${option}`,
      },
    })

    const bar = params => previous => previous.merge({
      params: Object.keys(params).reduce((finalParams, name) => ({
        ...finalParams,
        [name]: {
          bar: params[name],
        },
      }), {}),
      parsers: {
        bar: (value, option) => `${value}${option}`,
      },
    })

    expect(schema(
      {
        name: String,
      },
      foo({
        name: {
          foo: 'foo',
        },
      }),
      bar({
        name: 'bar',
      })
    ).parse({ name: 'test' })).toEqual({ name: 'testfoobar' })
  })

  it('composes schema', () => {
    const schema1 = schema({ age: Number })
    const schema2 = schema(schema1, { name: String })
    expect(schema2.parse({ name: 'Haz', age: '27' })).toEqual({
      name: 'Haz',
      age: 27,
    })
  })
})

describe('nested schema', () => {
  const studentSchema = schema({
    name: {
      type: String,
      required: true,
    },
    age: Number,
  })

  const teacherSchema = schema({
    name: {
      type: String,
      required: true,
    },
  })

  const classSchema = schema({
    name: {
      type: String,
      required: true,
    },
    teacher: {
      type: teacherSchema,
      required: true,
    },
    assistantTeacher: teacherSchema,
    students: {
      type: [studentSchema],
    },
    otherStudents: [studentSchema],
  })

  it('rejects validation', async () => {
    await expect(classSchema.validate()).rejects.toMatchSnapshot()
  })

  it('resolves validation', async () => {
    await expect(classSchema.validate({
      name: 'Computer Science',
      teacher: {
        name: 'Grace',
      },
    })).resolves.toMatchSnapshot()
  })

  it('parses', () => {
    expect(classSchema.parse()).toMatchSnapshot()
  })
})
