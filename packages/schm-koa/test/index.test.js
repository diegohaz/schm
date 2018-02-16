import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import request from 'supertest'
import { query, body, errorHandler } from '../src'

const servers = []

afterAll(() => servers.map(server => server.close()))

const createApp = middleware => {
  const app = new Koa()
  app.use(bodyParser())
  app.use(errorHandler())
  app.use(middleware)
  app.use(ctx => {
    ctx.body = ctx.state
  })
  const server = app.listen()
  servers.push(server)
  return server
}

describe('query', () => {
  it('handles ?foo as foo=true', async () => {
    const schema = query({ foo: [Boolean] })
    const app = createApp(schema)
    const response = await request(app).post('?foo')
    expect(response.body.query.foo).toEqual([true])
  })

  it('handles array in querystring', async () => {
    const schema = query({ foo: [String] })
    const app = createApp(schema)
    const response = await request(app).post('?foo=1&foo=baz')
    expect(response.body.query.foo).toEqual(['1', 'baz'])
  })

  it('handles errors', async () => {
    const schema = query({ foo: { type: Boolean, required: true } })
    const app = createApp(schema)
    const response = await request(app).post('/')
    expect(response.status).toBe(400)
    expect(response.body).toMatchSnapshot()
  })
})

describe('body', () => {
  it('handles schema', async () => {
    const schema = body({ foo: Boolean })
    const app = createApp(schema)
    const response = await request(app)
      .post('/')
      .send({ foo: 1 })
    expect(response.body.body.foo).toBe(true)
  })

  it('handles errors', async () => {
    const schema = body({ foo: { type: Boolean, required: true } })
    const app = createApp(schema)
    const response = await request(app).post('/')
    expect(response.status).toBe(400)
    expect(response.body).toMatchSnapshot()
  })
})

describe('errorHandler', () => {
  it('passes through', async () => {
    const app = createApp(() => Promise.reject())
    const response = await request(app).get('/')
    expect(response.status).toBe(404)
  })
})
