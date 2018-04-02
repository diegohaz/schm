import validatejs from "validate.js";
import schema from "../src/schema";
import validate from "../src/validate";

describe("validate", () => {
  it("fails with function", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => false
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with promise", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => Promise.reject()
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with function and message array", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [() => false, "{VALUE} is wrong!"]
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with function and message object", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: {
          validator: () => false,
          message: "{VALUE} is wrong!"
        }
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with promise and message array", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [() => Promise.reject(), "{VALUE} is wrong!"]
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with promise and message object", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: {
          validator: () => Promise.reject(),
          message: "{VALUE} is wrong!"
        }
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with nested param", async () => {
    const schm = schema({
      foo: {
        bar: [
          {
            type: String,
            validate: v => v !== "wrong"
          }
        ]
      }
    });
    await expect(
      validate({ foo: { bar: ["right", "wrong"] } }, schm)
    ).rejects.toMatchSnapshot();
  });

  it("fails with multiple function validators", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [v => v !== "wrong", v => v !== "notright"]
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
    await expect(validate({ foo: "notright" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with multiple array validators", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [
          [v => v !== "wrong", "{VALUE} is wrong!"],
          [v => v !== "notright", "{VALUE} is notright!"]
        ]
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
    await expect(validate({ foo: "notright" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with multiple object validators", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [
          { validator: v => v !== "wrong", message: "{VALUE} is wrong!" },
          { validator: v => v !== "notright", message: "{VALUE} is notright!" }
        ]
      }
    });
    await expect(validate({ foo: "wrong" }, schm)).rejects.toMatchSnapshot();
    await expect(validate({ foo: "notright" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with multiple params", async () => {
    const schm = schema({
      foo: { type: String, validate: () => false },
      bar: { type: String, validate: () => false }
    });
    await expect(
      validate({ foo: "wrong", bar: "wrong" }, schm)
    ).rejects.toMatchSnapshot();
  });

  it("passes with function", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => true
      }
    });
    await expect(validate({ foo: "right" }, schm)).resolves.toEqual({
      foo: "right"
    });
  });

  it("passes with promise", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: () => Promise.resolve()
      }
    });
    await expect(validate({ foo: "right" }, schm)).resolves.toEqual({
      foo: "right"
    });
  });

  it("throws if value is not a function", () => {
    const schm = schema({
      foo: {
        type: String,
        validate: "foo"
      }
    });
    expect(() => validate({ foo: "right" }, schm)).toThrow();
  });
});

describe("type", () => {
  it("fails with nested schema validator", async () => {
    const schm = schema({
      foo: {
        type: String,
        validate: [() => false, "foo"]
      }
    });
    const schm2 = schema({
      foos: [schm]
    });
    const values = { foos: [{ foo: "bar" }, { foo: "baz" }] };
    await expect(validate(values, schm2)).rejects.toMatchSnapshot();
  });

  it("calls custom nested schema validator", async () => {
    const customValidator = constraints => previous =>
      previous.merge({
        validate(values, paramPathPrefix) {
          const parsed = previous.parse(values);
          const transformKeys = object =>
            Object.keys(object).reduce(
              (finalObject, key) => ({
                ...finalObject,
                [[paramPathPrefix, key].join(".")]: object[key]
              }),
              {}
            );
          const errors = validatejs(values, constraints);
          return errors
            ? Promise.reject(transformKeys(errors))
            : Promise.resolve(parsed);
        }
      });
    const schm = schema(
      { foo: String },
      customValidator({ foo: { presence: true } })
    );
    const schm2 = schema({
      foos: [schm],
      bar: { type: String, required: true }
    });
    const values = { foos: [{}, { foo: "baz" }] };
    await expect(validate(values, schm2)).rejects.toMatchSnapshot();
  });
});

describe("required", () => {
  it("fails with value", async () => {
    const schm = schema({
      foo: {
        type: String,
        required: true
      }
    });
    await expect(validate(undefined, schm)).rejects.toMatchSnapshot();
  });

  it("fails with value and message array", async () => {
    const schm = schema({
      foo: {
        type: String,
        required: [true, "foo"]
      }
    });
    await expect(validate(undefined, schm)).rejects.toMatchSnapshot();
  });

  it("passes", async () => {
    const schm = schema({
      foo: {
        type: String,
        required: true
      }
    });
    await expect(validate({ foo: "foo" }, schm)).resolves.toEqual({
      foo: "foo"
    });
  });

  it("passes when option value is falsy", async () => {
    const schm = schema({
      foo: {
        type: String,
        required: false
      }
    });
    await expect(validate(undefined, schm)).resolves.toEqual({
      foo: undefined
    });
  });
});

describe("match", () => {
  it("fails with value", async () => {
    const schm = schema({
      foo: {
        type: String,
        match: /foo/
      }
    });
    await expect(validate({ foo: "bar" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with value and message array", async () => {
    const schm = schema({
      foo: {
        type: String,
        match: [/foo/, "foo"]
      }
    });
    await expect(validate({ foo: "bar" }, schm)).rejects.toMatchSnapshot();
  });

  it("passes", async () => {
    const schm = schema({
      foo: {
        type: String,
        match: /foo/
      }
    });
    await expect(validate({ foo: "foo" }, schm)).resolves.toEqual({
      foo: "foo"
    });
  });

  it("throws if value is not a regex", () => {
    const schm = schema({
      foo: {
        type: String,
        match: "foo"
      }
    });
    expect(() => validate({ foo: "foo" }, schm)).toThrow();
  });
});

describe("enum", () => {
  it("fails with value", async () => {
    const schm = schema({
      foo: {
        type: String,
        enum: ["foo", "bar"]
      }
    });
    await expect(validate({ foo: "baz" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with value and message object", async () => {
    const schm = schema({
      foo: {
        type: String,
        enum: { values: ["foo", "bar"], message: "foo" }
      }
    });
    await expect(validate({ foo: "baz" }, schm)).rejects.toMatchSnapshot();
  });

  it("passes", async () => {
    const schm = schema({
      foo: {
        type: String,
        enum: ["foo", "bar"]
      }
    });
    await expect(validate({ foo: "foo" }, schm)).resolves.toEqual({
      foo: "foo"
    });
  });

  it("throws if value is not an array", () => {
    const schm = schema({
      foo: {
        type: String,
        enum: "foo"
      }
    });
    expect(() => validate({ foo: "foo" }, schm)).toThrow();
  });
});

describe("max", () => {
  it("fails with value", async () => {
    const schm = schema({
      foo: {
        type: Number,
        max: 1
      }
    });
    await expect(validate({ foo: 2 }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with value and message array", async () => {
    const schm = schema({
      foo: {
        type: Number,
        max: [1, "foo"]
      }
    });
    await expect(validate({ foo: 2 }, schm)).rejects.toMatchSnapshot();
  });

  it("passes", async () => {
    const schm = schema({
      foo: {
        type: Number,
        max: 1
      }
    });
    await expect(validate({ foo: 1 }, schm)).resolves.toEqual({
      foo: 1
    });
  });
});

describe("min", () => {
  it("fails with value", async () => {
    const schm = schema({
      foo: {
        type: Number,
        min: 2
      }
    });
    await expect(validate({ foo: 1 }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with value and message array", async () => {
    const schm = schema({
      foo: {
        type: Number,
        min: [2, "foo"]
      }
    });
    await expect(validate({ foo: 1 }, schm)).rejects.toMatchSnapshot();
  });

  it("passes", async () => {
    const schm = schema({
      foo: {
        type: Number,
        min: 2
      }
    });
    await expect(validate({ foo: 2 }, schm)).resolves.toMatchSnapshot();
  });
});

describe("maxlength", () => {
  it("fails with value", async () => {
    const schm = schema({
      foo: {
        type: String,
        maxlength: 1
      }
    });
    await expect(validate({ foo: "12" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with value and message array", async () => {
    const schm = schema({
      foo: {
        type: String,
        maxlength: [1, "foo"]
      }
    });
    await expect(validate({ foo: "12" }, schm)).rejects.toMatchSnapshot();
  });

  it("passes", async () => {
    const schm = schema({
      foo: {
        type: String,
        maxlength: 1
      }
    });
    await expect(validate({ foo: "1" }, schm)).resolves.toEqual({
      foo: "1"
    });
  });
});

describe("minlength", () => {
  it("fails with value", async () => {
    const schm = schema({
      foo: {
        type: String,
        minlength: 2
      }
    });
    await expect(validate({ foo: "1" }, schm)).rejects.toMatchSnapshot();
  });

  it("fails with value and message array", async () => {
    const schm = schema({
      foo: {
        type: String,
        minlength: [2, "foo"]
      }
    });
    await expect(validate({ foo: "1" }, schm)).rejects.toMatchSnapshot();
  });

  it("passes", async () => {
    const schm = schema({
      foo: {
        type: String,
        minlength: 2
      }
    });
    await expect(validate({ foo: "12" }, schm)).resolves.toEqual({
      foo: "12"
    });
  });
});

test("without schema", async () => {
  const params = { foo: { type: String, required: true } };
  await expect(validate({}, params)).rejects.toMatchSnapshot();
});

test("custom option", async () => {
  const schm = schema({
    foo: {
      type: String,
      bar: "baz",
      required: true
    }
  });
  await expect(validate({ foo: "12" }, schm)).resolves.toEqual({
    foo: "12"
  });
});

test("validator must be a function", () => {
  const schm = schema(
    {
      foo: {
        type: String,
        bar: "baz"
      }
    },
    previous =>
      previous.merge({
        validators: {
          bar: true
        }
      })
  );
  expect(() => validate({}, schm)).toThrow();
});
