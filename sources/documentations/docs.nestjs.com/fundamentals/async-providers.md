---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/fundamentals/async-providers"
crawled_at: "2026-06-23T15:19:48.622Z"
---

### Asynchronous providers

At times, the application start should be delayed until one or more **asynchronous tasks** are completed. For example, you may not want to start accepting requests until the connection with the database has been established. You can achieve this using asynchronous providers.

The syntax for this is to use `async/await` with the `useFactory` syntax. The factory returns a `Promise`, and the factory function can `await` asynchronous tasks. Nest will await resolution of the promise before instantiating any class that depends on (injects) such a provider.

```

{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```

> **Hint** Learn more about custom provider syntax [here](https://docs.nestjs.com/fundamentals/custom-providers).

#### Injection[#](https://docs.nestjs.com/fundamentals/async-providers#injection)

Asynchronous providers are injected to other components by their tokens, like any other provider. In the example above, you would use the construct `@Inject('ASYNC_CONNECTION')`.

#### Example[#](https://docs.nestjs.com/fundamentals/async-providers#example)

[The TypeORM recipe](https://docs.nestjs.com/recipes/sql-typeorm) has a more substantial example of an asynchronous provider.
