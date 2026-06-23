---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/websockets/pipes"
crawled_at: "2026-06-23T15:22:40.144Z"
---

### Pipes

There is no fundamental difference between [regular pipes](https://docs.nestjs.com/pipes) and web sockets pipes. The only difference is that instead of throwing `HttpException`, you should use `WsException`. In addition, all pipes will be only applied to the `data` parameter (because validating or transforming `client` instance is useless).

> **Hint** The `WsException` class is exposed from `@nestjs/websockets` package.

#### Binding pipes[#](https://docs.nestjs.com/websockets/pipes#binding-pipes)

The following example uses a manually instantiated method-scoped pipe. Just as with HTTP based applications, you can also use gateway-scoped pipes (i.e., prefix the gateway class with a `@UsePipes()` decorator).

JS TS

```

@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

```

@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client, data) {
  const event = 'events';
  return { event, data };
}
```
