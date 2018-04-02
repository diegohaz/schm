import { operator } from "../src/parsers";

describe("operator", () => {
  test("empty", () => {
    expect(operator("foo")).toBe("foo");
  });

  test("$eq", () => {
    expect(operator("foo", "$eq")).toBe("foo");
  });

  test("$eq array", () => {
    expect(operator(["foo"], "$eq")).toEqual({ $in: ["foo"] });
  });

  test("$in array", () => {
    expect(operator(["foo"], "$in")).toEqual({ $in: ["foo"] });
  });
});
