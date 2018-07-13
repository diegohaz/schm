# <img src="logo/logo.svg" width="200">

[![Build Status](https://img.shields.io/travis/diegohaz/schm/master.svg?style=flat-square)](https://travis-ci.org/diegohaz/schm) [![Coverage Status](https://img.shields.io/codecov/c/github/diegohaz/schm/master.svg?style=flat-square)](https://codecov.io/gh/diegohaz/schm/branch/master)

- [**Introductory article**](https://medium.freecodecamp.org/how-to-write-powerful-schemas-in-javascript-490da6233d37)
- [**Main documentation**](packages/schm#readme)
- [**Examples**](https://runkit.com/diegohaz/schm)

<br>
<hr>
<p align="center">
If you find this useful, please don't forget to star ⭐️ the repo, as this will help to promote the project.<br>
Follow me on <a href="https://twitter.com/diegohaz">Twitter</a> and <a href="https://github.com/diegohaz">GitHub</a> to keep updated about this project and <a href="https://github.com/diegohaz?tab=repositories">others</a>.
</p>
<hr>
<br><br>

**schm** is a library for creating immutable, composable, parseable and validatable (yeah, many *ables) schemas in JavaScript and Node.js. That's highly inspired by [functional programming](https://en.wikipedia.org/wiki/Functional_programming) paradigm.

Play with `schm` on [RunKit](https://runkit.com/diegohaz/schm) (click on *Clone and edit this document* at the bottom and skip login if you want).

```js
const schema = require('schm')

const userSchema = schema({
  name: String,
  age: {
    type: Number,
    min: 18,
  },
})

userSchema.parse({
  name: 'Haz',
  age: '27',
})

await userSchema.validate({
  name: 'Jeane',
  age: 10,
})
```

Output:
```js
// parsed
{
  name: 'Haz',
  age: 27,
}

// validate error
[
  {
    "param": "age",
    "value": 10,
    "validator": "min",
    "min": 18,
    "message": "age must be greater than or equal 18"
  }
]
```

The way you declare the schema object is very similar to [mongoose Schemas](http://mongoosejs.com/docs/guide.html). So, refer to their docs to learn more.

## Packages

`schm` repository is a [monorepo](https://danluu.com/monorepo/) managed by [lerna](https://github.com/lerna/lerna). Click on package name to see specific **documentation**.

| Package | Version | Description |
|---|---|---|
| [`schm`](packages/schm) | [![NPM version](https://img.shields.io/npm/v/schm.svg?style=flat-square)](https://npmjs.org/package/schm) | The main package |
| [`schm-computed`](packages/schm-computed) | [![NPM version](https://img.shields.io/npm/v/schm-computed.svg?style=flat-square)](https://npmjs.org/package/schm-computed) | Adds computed parameters to schemas |
| [`schm-express`](packages/schm-express) | [![NPM version](https://img.shields.io/npm/v/schm-express.svg?style=flat-square)](https://npmjs.org/package/schm-express) | Express middlewares to handle querystring and response body |
| [`schm-koa`](packages/schm-koa) | [![NPM version](https://img.shields.io/npm/v/schm-koa.svg?style=flat-square)](https://npmjs.org/package/schm-koa) | Koa middlewares to handle querystring and response body |
| [`schm-methods`](packages/schm-methods) | [![NPM version](https://img.shields.io/npm/v/schm-methods.svg?style=flat-square)](https://npmjs.org/package/schm-methods) | Adds methods to parsed schema objects |
| [`schm-mongo`](packages/schm-mongo) | [![NPM version](https://img.shields.io/npm/v/schm-mongo.svg?style=flat-square)](https://npmjs.org/package/schm-mongo) | Parses values to MongoDB queries |
| [`schm-translate`](packages/schm-translate) | [![NPM version](https://img.shields.io/npm/v/schm-translate.svg?style=flat-square)](https://npmjs.org/package/schm-translate) | Translates values keys to schema keys |

## Contributing

When submitting an issue, put the related package between brackets in the title:

```sh
[methods] Something wrong is not right # related to schm-methods
[translate] Something right is not wrong # related to schm-translate
Something wrong is wrong # general issue
```

PRs are welcome. You should have a look at [lerna](https://github.com/lerna/lerna) to understand how this repository works.

After cloning the repository, run `yarn`. That will install all the project dependencies, including the packages ones.

Before submitting a PR:

1. Make sure to lint the code: `yarn lint` or `lerna run lint`;
2. Make sure tests are passing: `yarn test` or `lerna run test`;

## License

MIT © [Diego Haz](https://github.com/diegohaz)
