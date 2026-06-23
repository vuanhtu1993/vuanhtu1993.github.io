---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/microservices/guards"
crawled_at: "2026-06-23T15:23:19.724Z"
---

### Guards

There is no fundamental difference between microservices guards and [regular HTTP application guards](https://docs.nestjs.com/guards). The only difference is that instead of throwing `HttpException`, you should use `RpcException`.

> **Hint** The `RpcException` class is exposed from `@nestjs/microservices` package.

#### Binding guards[#](https://docs.nestjs.com/microservices/guards#binding-guards)

The following example uses a method-scoped guard. Just as with HTTP based applications, you can also use controller-scoped guards (i.e., prefix the controller class with a `@UseGuards()` decorator).

JS TS

```

@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

```

@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```
