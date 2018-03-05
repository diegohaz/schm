// @flow
import schema from 'schm'
import qs from 'qs'

const convertEmptyToTrue = (object: Object): Object =>
  Object.keys(object).reduce(
    (finalObject, key) => ({
      ...finalObject,
      [key]: object[key] === '' ? true : object[key],
    }),
    {},
  )

/**
 * Returns a koa middleware that validates and parses querystring based
 * on a given schema.
 * @example
 * const Koa = require('koa')
 * const { query } = require('schm-koa')
 *
 * const app = new Koa()
 *
 * app.use(query({ foo: Boolean, bar: [String] }))
 *
 * // request /?foo&bar=1&bar=baz
 * app.use((ctx) => {
 *   console.log(ctx.state.query) // { foo: true, bar: ['1', 'baz'] }
 * })
 */
export const query = (params: Object) => async (
  ctx: Object,
  next: Function,
) => {
  const querySchema = schema(params)
  const values = convertEmptyToTrue(qs.parse(ctx.query))
  try {
    ctx.state.query = await querySchema.validate(values)
    next()
  } catch (e) {
    ctx.state.schmError = true
    throw e
  }
}

/**
 * Returns a koa middleware that validates and parses request body based
 * on a given schema.
 * @example
 * const Koa = require('koa')
 * const bodyParser = require('koa-bodyparser')
 * const { body } = require('schm-koa')
 *
 * const app = new Koa()
 *
 * app.use(bodyParser())
 * app.use(body({ foo: Boolean, bar: [String] }))
 *
 * // send { foo: 1, bar: 'baz' }
 * app.use((ctx) => {
 *   console.log(ctx.state.body) // { foo: true, bar: ['baz'] }
 * })
 */
export const body = (params: Object) => async (ctx: Object, next: Function) => {
  const bodySchema = schema(params)
  try {
    ctx.state.body = await bodySchema.validate(ctx.request.body)
    next()
  } catch (e) {
    ctx.state.schmError = true
    throw e
  }
}

/**
 * Handles errors from schm-koa.
 * @example
 * const Koa = require('koa')
 * const { query, errorHandler } = require('schm-koa')
 *
 * const app = new Koa()
 *
 * app.use(errorHandler())
 * app.use(query({ foo: { type: Boolean, required: true } }))
 *
 * // request / without querystring
 * app.use((ctx) => {
 *   ...
 * })
 *
 * // it will respond with 400 and error descriptor in response body
 */
export const errorHandler = () => async (ctx: Object, next: Function) => {
  try {
    await next()
  } catch (e) {
    if (ctx.state.schmError) {
      ctx.body = e
      ctx.status = 400
    }
  }
}
