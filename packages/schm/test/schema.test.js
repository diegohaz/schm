import { decamelizeKeys } from "humps";
import validatejs from "validate.js";
import schema, { group } from "../src/schema";

test("parse", () => {
  const schm = schema({ foo: String });
  expect(schm.parse({ foo: 1 })).toEqual({ foo: "1" });
});

test("validate", async () => {
  const schm = schema({
    foo: {
      type: String,
      required: true
    }
  });
  await expect(schm.validate()).rejects.toMatchSnapshot();
});

test("custom parse", () => {
  const customParse = previous =>
    previous.merge({
      parse(values) {
        return decamelizeKeys(previous.parse(values));
      }
    });
  const schm = schema({ fooBar: [{ barBaz: String }] }, customParse);
  const values = {
    fooBar: [{ barBaz: "foo" }, { barBaz: "bar" }]
  };
  expect(schm.parse(values)).toEqual({
    foo_bar: [{ bar_baz: "foo" }, { bar_baz: "bar" }]
  });
});

test("custom validate", async () => {
  const customValidate = constraints => previous =>
    previous.merge({
      async validate(values) {
        const parsed = previous.parse(values);
        return validatejs(parsed, constraints);
      }
    });
  const constraints = { foo: { presence: true } };
  const schm = schema({ foo: String }, customValidate(constraints));
  await expect(schm.validate()).resolves.toEqual({
    foo: ["Foo can't be blank"]
  });
});

test("custom parser", () => {
  const customParser = previous =>
    previous.merge({
      parsers: {
        exclaim: value => `${value}!!`
      }
    });
  const params = { foo: { type: String, exclaim: true } };
  const schm = schema(params, customParser);
  const values = { foo: "bar" };
  expect(schm.parse(values)).toEqual({ foo: "bar!!" });
});

test("custom validator", async () => {
  const customValidator = previous =>
    previous.merge({
      validators: {
        exclamation: () => ({ valid: false })
      }
    });
  const params = { foo: { type: String, exclamation: true } };
  const schm = schema(params, customValidator);
  const values = { foo: "bar" };
  await expect(schm.validate(values)).rejects.toEqual([
    {
      exclamation: true,
      param: "foo",
      validator: "exclamation",
      value: "bar"
    }
  ]);
});

test("custom params", () => {
  const customParams = previous =>
    previous.merge({
      params: {
        bar: String
      }
    });
  const schm = schema({ foo: String }, customParams);
  const values = { foo: 1, bar: 2 };
  expect(schm.parse(values)).toEqual({ foo: "1", bar: "2" });
});

describe("composition", () => {
  it("composes schema group", () => {
    const concatWithFoo = params => previous =>
      previous.merge({
        params,
        parsers: {
          foo: (value, option) => `${value}${option}`
        }
      });

    const concatWithDefaultValue = params => previous =>
      previous.merge({
        params: Object.keys(params).reduce(
          (finalParams, name) => ({
            ...finalParams,
            [name]: {
              bar: params[name]
            }
          }),
          {}
        ),
        parsers: {
          bar: (value, option) => `${value}${option}`
        }
      });

    const schm = schema(
      {
        name: String
      },
      concatWithFoo({
        name: {
          foo: "foo"
        }
      }),
      concatWithDefaultValue({
        name: "bar"
      })
    );

    expect(schm.parse({ name: "test" })).toEqual({ name: "testfoobar" });
  });

  it("composes schema", () => {
    const schema1 = schema({ age: Number });
    const schema2 = schema(schema1, { name: String });
    expect(schema2.parse({ name: "Haz", age: "27" })).toEqual({
      name: "Haz",
      age: 27
    });
  });

  it("composes multiple schema", () => {
    const schema1 = schema({ age: Number });
    const schema2 = schema({ name: String });
    const schema3 = schema(schema1, schema2);
    expect(schema3.parse({ name: "Haz", age: "27" })).toEqual({
      name: "Haz",
      age: 27
    });
  });
});

test("group", () => {
  const schm = schema(
    group({
      foo: String
    }),
    group(),
    group({
      bar: String
    })
  );
  const values = { foo: 1, bar: 2 };
  expect(schm.parse(values)).toEqual({ foo: "1", bar: "2" });
});
