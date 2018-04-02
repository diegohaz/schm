import faker, { name, lorem } from "faker";
import times from "lodash/times";
import mapValues from "../src/mapValues";
import schema from "../src/schema";

const createPerson = () => ({ name: name.firstName(), age: 20 });
const createStudent = () => ({ ...createPerson(), grade: 5 });
const createTeacher = () => ({
  ...createPerson(),
  subjects: times(3, lorem.word)
});
const createClass = () => ({
  grade: 5,
  subject: lorem.word(),
  teacher: createTeacher(),
  students: times(5, createStudent)
});

const personSchema = schema({
  name: String,
  age: Number
});
const studentSchema = schema(personSchema, {
  grade: Number
});
const teacherSchema = schema(personSchema, {
  subjects: [String]
});
const classSchema = schema({
  grade: Number,
  subject: String,
  teacher: teacherSchema,
  students: [studentSchema]
});

beforeEach(() => {
  faker.seed(123);
});

it("maps values correctly", () => {
  const values = createClass();
  const transformValue = value => value;
  expect(
    mapValues(values, classSchema.params, transformValue)
  ).toMatchSnapshot();
});
