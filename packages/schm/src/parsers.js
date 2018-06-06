// @flow
import type { Parser } from ".";
import { toArray, isArray, isSchema } from "./utils";

export const type: Parser = (value, option) => {
  if (isArray(option)) {
    return toArray(value).map(val => type(val, option[0]));
  }
  if (isSchema(option)) {
    return option.parse(value);
  }
  if (value == null) {
    return value;
  }
  switch (option.name) {
    case "RegExp":
      return new RegExp(value, "i");
    case "Date":
      return new Date(/^\d{5,}$/.test(value) ? Number(value) : value);
    case "Boolean":
      return !(value === "false" || value === "0" || !value);
    case "Number":
      return Number(value);
    case "Object":
      return Object(value);
    case "String":
      return String(value);
    default:
      return value;
  }
};

export const set: Parser = (value, option) => {
  if (typeof option === "function") {
    return option(value);
  }
  throw new Error("[schm] `set` option must be a function");
};

export const get: Parser = (value, option) => {
  if (typeof option === "function") {
    return option(value);
  }
  throw new Error("[schm] `get` option must be a function");
};

export const lowercase: Parser = (value, option) => {
  if (option && value) {
    if (typeof value.toLowerCase === "function") {
      return value.toLowerCase();
    }
    throw new Error(
      `[schm] value must be a string to be lowercased. Instead, received ${typeof value}`
    );
  }
  return value;
};

export const uppercase: Parser = (value, option) => {
  if (option && value) {
    if (typeof value.toUpperCase === "function") {
      return value.toUpperCase();
    }
    throw new Error(
      `[schm] value must be a string to be uppercased. Instead, received ${typeof value}`
    );
  }
  return value;
};

export const trim: Parser = (value, option) => {
  if (option && value) {
    if (typeof value.trim === "function") {
      return value.trim();
    }
    throw new Error(
      `[schm] value must be a string to be trimmed. Instead, received ${typeof value}`
    );
  }
  return value;
};

export const defaultParser: Parser = (value, option) => {
  if (value == null || value === "" || Number.isNaN(value)) {
    return typeof option === "function" ? option() : option;
  }
  return value;
};

export default {
  type,
  set,
  get,
  lowercase,
  uppercase,
  trim,
  default: defaultParser
};
