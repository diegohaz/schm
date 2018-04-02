import schema from "../../schm/src";
import translate from "../../schm-translate/src";
import near from "../src/near";

test("default", () => {
  const schm = schema(near("loc"));
  const values = {
    near: "10,20"
  };
  expect(schm.parse(values)).toEqual({
    loc: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [10, 20]
        }
      }
    }
  });
});

test("array", () => {
  const schm = schema(near("loc"));
  const values = {
    near: [-10, 20]
  };
  expect(schm.parse(values)).toEqual({
    loc: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [-10, 20]
        }
      }
    }
  });
});

test("translate", () => {
  const schm = schema(
    near("loc"),
    translate({ near: "location", min_distance: "min", max_distance: "max" })
  );
  const values = {
    location: [30.5, -10],
    min: 10,
    max: 20
  };
  expect(schm.parse(values)).toEqual({
    loc: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [30.5, -10]
        },
        $minDistance: 10,
        $maxDistance: 20
      }
    }
  });
});

test("without coordinates", () => {
  const schm = schema(near("loc"));
  const values = {
    location: null
  };
  expect(schm.parse(values)).toEqual({});
});
