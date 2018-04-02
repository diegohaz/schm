import schema from "../../schm/src";
import query from "../src/query";

test("simple without paths", () => {
  const schm = schema(
    {
      title: RegExp,
      date: Date
    },
    query()
  );
  const values = {
    title: "foo",
    date: "2018-01-01"
  };
  expect(schm.parse(values)).toEqual({
    title: /foo/i,
    date: new Date("2018-01-01")
  });
});

test("single path", () => {
  const schm = schema(
    {
      title: RegExp,
      date: Date,
      after: { type: Date, operator: "$gte" }
    },
    query({
      after: ["date"]
    })
  );
  const values = {
    title: "foo",
    after: "2018-01-01"
  };
  expect(schm.parse(values)).toEqual({
    title: /foo/i,
    date: { $gte: new Date("2018-01-01") }
  });
});

test("multiple paths", () => {
  const schm = schema(
    {
      title: String,
      description: String,
      term: RegExp,
      after: { type: Date, operator: "$gte" },
      before: { type: Date, operator: "$lte" }
    },
    query({
      term: ["title", "description"],
      after: ["date"],
      before: ["date"]
    })
  );
  const values = {
    term: "foo",
    after: "2018-01-01",
    before: "2018-03-03"
  };
  expect(schm.parse(values)).toEqual({
    $and: [
      {
        $or: [{ title: /foo/i }, { description: /foo/i }]
      },
      { date: { $gte: new Date("2018-01-01") } },
      { date: { $lte: new Date("2018-03-03") } }
    ]
  });
});
