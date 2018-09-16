import Koa from "koa";
import bodyParser from "koa-bodyparser";
import request from "supertest";
import { query, body, errorHandler } from "../src";

const servers = [];

afterAll(() => servers.map(server => server.close()));

const createApp = (middleware, teapot) => {
  const app = new Koa();
  app.use(bodyParser());
  app.use(errorHandler());
  if(teapot) {
    app.use(teapot.errorHandler());
  }
  app.use(middleware);
  if(teapot) {
    app.use(teapot.middleware());
  }
  app.use(async (ctx, next) => {
    async function sign() {
      return new Promise((resolve) => {
        setTimeout(resolve, 500, "random");
      })
    }
    await sign();
    next();
  });
  app.use(ctx => {
    ctx.body = ctx.state;
  });
  const server = app.listen();
  servers.push(server);
  return server;
};

describe("query", () => {
  it("handles ?foo as foo=true", async () => {
    const schema = query({ foo: [Boolean] });
    const app = createApp(schema);
    const response = await request(app).post("?foo");
    expect(response.body.query.foo).toEqual([true]);
  });

  it("handles array in querystring", async () => {
    const schema = query({ foo: [String] });
    const app = createApp(schema);
    const response = await request(app).post("?foo=1&foo=baz");
    expect(response.body.query.foo).toEqual(["1", "baz"]);
  });

  it("handles nested object in querystring", async () => {
    const schema = query({ foo: { bar: String } });
    const app = createApp(schema);
    const response = await request(app).post("?foo[bar]=1");
    expect(response.body.query.foo).toEqual({ bar: "1" });
  });

  it("handles errors", async () => {
    const schema = query({ foo: { type: Boolean, required: true } });
    const app = createApp(schema);
    const response = await request(app).post("/");
    expect(response.status).toBe(400);
    expect(response.body).toMatchSnapshot();
  });

  it("should not catch errors thrown by subsequent middlewares", async () => {
    const errorHandler = () => async (ctx, next) => {
      try {
        await next();
      } catch (e) {
        if(ctx.state.schmError) {
          ctx.status = 500;
        } else {
          ctx.status = e.status;
        }
      }
    }
    const middleware = () => (ctx) => {
      ctx.throw(418);
    }
    const schema = query({ foo: [Boolean] });
    const app = createApp(schema, { middleware, errorHandler });
    const response = await request(app).post("?foo");
    expect(response.status).toBe(418);
  });

});


describe("body", () => {
  it("handles schema", async () => {
    const schema = body({ foo: Boolean });
    const app = createApp(schema);
    const response = await request(app)
      .post("/")
      .send({ foo: 1 });
    expect(response.body.body.foo).toBe(true);
  });

  it("handles errors", async () => {
    const schema = body({ foo: { type: Boolean, required: true } });
    const app = createApp(schema);
    const response = await request(app).post("/");
    expect(response.status).toBe(400);
    expect(response.body).toMatchSnapshot();
  });

  it("should not catch errors thrown by subsequent middlewares", async () => {
    const errorHandler = () => async (ctx, next) => {
      try {
        await next();
      } catch (e) {
        if(ctx.state.schmError) {
          ctx.status = 500;
        } else {
          ctx.status = e.status;
        }
      }
    }
    const middleware = () => (ctx) => {
      ctx.throw(418);
    }
    const schema = body({ foo: Boolean });
    const app = createApp(schema, { middleware, errorHandler });
    const response = await request(app)
      .post("/")
      .send({ foo: 1 });
    expect(response.status).toBe(418);
  });

});

describe("errorHandler", () => {
  it("passes through", async () => {
    const app = createApp(() => Promise.reject());
    const response = await request(app).get("/");
    expect(response.status).toBe(404);
  });
});
