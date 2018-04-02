import schema from "../src";
import {
  toArray,
  isArray,
  isSchema,
  isFunction,
  isObject,
  parseValidatorOption
} from "../src/utils";

test("toArray", () => {
  expect(toArray("foo")).toEqual(["foo"]);
  expect(toArray(["foo"])).toEqual(["foo"]);
  expect(toArray(undefined)).toEqual([]);
});

test("isArray", () => {
  expect(isArray("foo")).toBe(false);
  expect(isArray(["foo"])).toBe(true);
});

test("isSchema", () => {
  expect(isSchema({})).toBe(false);
  expect(isSchema(schema())).toBe(true);
});

test("isFunction", () => {
  expect(isFunction("foo")).toBe(false);
  expect(isFunction(() => {})).toBe(true);
});

test("isObject", () => {
  expect(isObject("foo")).toBe(false);
  expect(isObject({})).toBe(true);
});

describe("parseValidatorOption", () => {
  test("single value", () => {
    const option = true;
    expect(parseValidatorOption(option)).toEqual({ optionValue: true });
  });

  test("array", () => {
    const option = [true, "message"];
    expect(parseValidatorOption(option)).toEqual({
      optionValue: true,
      message: "message"
    });
  });

  test("object", () => {
    const option = { valid: true, message: "message" };
    expect(parseValidatorOption(option)).toEqual({
      optionValue: true,
      message: "message"
    });
  });

  test("short object", () => {
    const option = { valid: true, msg: "message" };
    expect(parseValidatorOption(option)).toEqual({
      optionValue: true,
      message: "message"
    });
  });

  test("schema", () => {
    const schm = schema({ foo: String });
    expect(parseValidatorOption(schm)).toEqual({
      optionValue: schm
    });
  });
});
