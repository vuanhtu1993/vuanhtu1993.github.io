---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/microservices/pipes"
crawled_at: "2026-06-23T15:23:17.314Z"
---

### Pipes

There is no fundamental difference between [regular pipes](https://docs.nestjs.com/pipes) and microservices pipes. The only difference is that instead of throwing `HttpException`, you should use `RpcException`.

> **Hint** The `RpcException` class is exposed from `@nestjs/microservices` package.

#### Binding pipes[#](https://docs.nestjs.com/microservices/pipes#binding-pipes)

The following example uses a manually instantiated method-scoped pipe. Just as with HTTP based applications, you can also use controller-scoped pipes (i.e., prefix the controller class with a `@UsePipes()` decorator).

JS TS

```

@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

```

@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```
