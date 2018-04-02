import schema from "../src/schema";
import parse from "../src/parse";

it("throws when parser is not a function", () => {
  const schm = schema(previous =>
    previous.merge({
      params: {
        foo: {
          type: String,
          bar: "baz"
        }
      },
      parsers: {
        bar: "notfunction"
      }
    })
  );
  expect(() => parse({ foo: "foo" }, schm)).toThrow();
});

test("no schema", () => {
  const values = { foo: 2 };
  expect(parse(values, schema())).toEqual({});
});

test("type", () => {
  const values = { foo: 2 };
  expect(parse(values, schema({ foo: String }))).toEqual({ foo: "2" });
  expect(parse(values, schema({ foo: { type: String } }))).toEqual({
    foo: "2"
  });
  expect(parse(values, schema({ foo: [Boolean] }))).toEqual({ foo: [true] });
});

test("set", () => {
  const schm = schema({
    foo: { type: String, set: value => `${value}!!` }
  });
  const values = { foo: "bar" };
  expect(parse(values, schm)).toEqual({ foo: "bar!!" });
});

test("get", () => {
  const schm = schema({
    foo: { type: String, get: value => `${value}!!` }
  });
  const values = { foo: "bar" };
  expect(parse(values, schm)).toEqual({ foo: "bar!!" });
});

test("lowercase", () => {
  const schm = schema({
    foo: { type: String, lowercase: true }
  });
  expect(parse({ foo: "FOO" }, schm)).toEqual({ foo: "foo" });
  const schm2 = schema({
    foo: { type: String, default: "FOO", lowercase: true }
  });
  expect(parse(undefined, schm2)).toEqual({ foo: "foo" });
});

test("uppercase", () => {
  const schm = schema({
    foo: { type: String, uppercase: true }
  });
  expect(parse({ foo: "foo" }, schm)).toEqual({ foo: "FOO" });
  const schm2 = schema({
    foo: { type: String, default: "foo", uppercase: true }
  });
  expect(parse(undefined, schm2)).toEqual({ foo: "FOO" });
});

test("trim", () => {
  const schm = schema({
    foo: { type: String, trim: true }
  });
  expect(parse({ foo: "  bar " }, schm)).toEqual({ foo: "bar" });
  const schm2 = schema({
    foo: { type: String, default: "  bar   ", trim: true }
  });
  expect(parse(undefined, schm2)).toEqual({ foo: "bar" });
});

test("default", () => {
  const schm = schema({ foo: "bar" });
  expect(parse(undefined, schm)).toEqual({ foo: "bar" });
  expect(parse({ foo: 2 }, schm)).toEqual({ foo: "2" });
  const schm2 = schema({
    foo: { type: String, default: "bar" }
  });
  expect(parse(undefined, schm2)).toEqual({ foo: "bar" });
});

test("without schema", () => {
  const params = { foo: String };
  const values = { foo: 1 };
  expect(parse(values, params)).toEqual({ foo: "1" });
});

describe("nested object", () => {
  test("empty object", () => {
    expect(parse({ foo: 2 }, schema({ foo: {} }))).toEqual({ foo: {} });
  });

  test("object with type properties", () => {
    const schm = schema({
      foo: { bar: String, baz: Number }
    });
    const values = { foo: { bar: 1, baz: "2" } };
    expect(parse(values, schm)).toEqual({ foo: { bar: "1", baz: 2 } });
  });

  test("object with type", () => {
    const schm = schema({
      foo: { type: Object, bar: String }
    });
    const values = { foo: { bar: 1 } };
    expect(parse(values, schm)).toEqual({ foo: { bar: 1 } });
  });

  test("nested array of object", () => {
    const schm = schema({
      foo: [{ bar: String, baz: Number }]
    });
    const values = { foo: [{ bar: 1, baz: "2" }, { bar: "1", baz: 2 }] };
    expect(parse(values, schm)).toEqual({
      foo: [{ bar: "1", baz: 2 }, { bar: "1", baz: 2 }]
    });
  });

  test("extremely nested", () => {
    const obj = qux => ({ foo: { bar: [{ baz: { qux } }] } });
    expect(parse(obj(1), schema(obj(String)))).toEqual(obj("1"));
  });
});

describe("nested schema", () => {
  test("calls parse from previous schema", () => {
    const fn = jest.fn(v => v);
    const schm1 = schema(
      {
        bar: String
      },
      previous =>
        previous.merge({
          parse(values) {
            return fn(previous.parse(values));
          }
        })
    );
    const schm2 = schema(
      {
        foo: [schm1]
      },
      previous =>
        previous.merge({
          parse(values) {
            // it should not be called because we aren't using schm2.parse
            return fn(previous.parse(values));
          }
        })
    );
    const values = {
      foo: [{ bar: "baz" }, { bar: "qux" }]
    };
    expect(parse(values, schm2)).toEqual(values);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith({ bar: "baz" });
    expect(fn).toHaveBeenCalledWith({ bar: "qux" });
  });
});
