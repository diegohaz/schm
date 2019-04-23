import schema from "../../schm/src";
import translate from "../src";

test("translate", () => {
  const schm = schema(
    {
      name: String
    },
    translate({
      name: "foo.bar"
    })
  );

  expect(schm.parse({ foo: { bar: "John" } })).toEqual({ name: "John" });
});

test("parse without values", () => {
  const schm = schema(
    {
      name: String
    },
    translate({
      name: "foo.bar"
    })
  );

  expect(schm.parse()).toEqual({ name: undefined });
});

test("parse nested schemas", () => {
  const schm = schema(
    {
      name: String
    },
    translate({
      name: "foo.bar"
    })
  );

  const nested = schema({
    dog: String,
    owner: schm
  });

  expect(
    nested.parse({ dog: "Fido", owner: { foo: { bar: "John" } } })
  ).toEqual({ dog: "Fido", owner: { name: "John" } });
});
