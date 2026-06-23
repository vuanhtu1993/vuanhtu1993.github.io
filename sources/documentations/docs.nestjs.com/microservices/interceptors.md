---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/microservices/interceptors"
crawled_at: "2026-06-23T15:23:22.087Z"
---

### Interceptors

There is no difference between [regular interceptors](https://docs.nestjs.com/interceptors) and microservices interceptors. The following example uses a manually instantiated method-scoped interceptor. Just as with HTTP based applications, you can also use controller-scoped interceptors (i.e., prefix the controller class with a `@UseInterceptors()` decorator).

JS TS

```

@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

```

@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```
