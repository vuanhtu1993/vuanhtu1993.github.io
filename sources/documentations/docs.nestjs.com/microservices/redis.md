---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/microservices/redis"
crawled_at: "2026-06-23T15:22:55.264Z"
---

### Redis

The [Redis](https://redis.io/) transporter implements the publish/subscribe messaging paradigm and leverages the [Pub/Sub](https://redis.io/topics/pubsub) feature of Redis. Published messages are categorized in channels, without knowing what subscribers (if any) will eventually receive the message. Each microservice can subscribe to any number of channels. In addition, more than one channel can be subscribed to at a time. Messages exchanged through channels are **fire-and-forget**, which means that if a message is published and there are no subscribers interested in it, the message is removed and cannot be recovered. Thus, you don't have a guarantee that either messages or events will be handled by at least one service. A single message can be subscribed to (and received) by multiple subscribers.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782228174/aha-mind/docs-crawler/docs.nestjs.com/Redis_1_kpwmi6.png)

#### Installation[#](https://docs.nestjs.com/microservices/redis#installation)

To start building Redis-based microservices, first install the required package:

```

$ npm i --save ioredis
```

#### Overview[#](https://docs.nestjs.com/microservices/redis#overview)

To use the Redis transporter, pass the following options object to the `createMicroservice()` method:

main.ts

JS TS

```

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});
```

```

const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});
```

> **Hint** The `Transport` enum is imported from the `@nestjs/microservices` package.

#### Options[#](https://docs.nestjs.com/microservices/redis#options)

The `options` property is specific to the chosen transporter. The **Redis** transporter exposes the properties described below.

<table><tbody><tr><td><code>host</code></td><td>Connection url</td></tr><tr><td><code>port</code></td><td>Connection port</td></tr><tr><td><code>retryAttempts</code></td><td>Number of times to retry message (default: <code>0</code>)</td></tr><tr><td><code>retryDelay</code></td><td>Delay between message retry attempts (ms) (default: <code>0</code>)</td></tr><tr><td><code>wildcards</code></td><td>Enables Redis wildcard subscriptions, instructing transporter to use <code>psubscribe</code>/<code>pmessage</code> under the hood. (default: <code>false</code>)</td></tr></tbody></table>

All the properties supported by the official [ioredis](https://redis.github.io/ioredis/index.html#RedisOptions) client are also supported by this transporter.

#### Client[#](https://docs.nestjs.com/microservices/redis#client)

Like other microservice transporters, you have [several options](https://docs.nestjs.com/microservices/basics#client) for creating a Redis `ClientProxy` instance.

One method for creating an instance is to use the `ClientsModule`. To create a client instance with the `ClientsModule`, import it and use the `register()` method to pass an options object with the same properties shown above in the `createMicroservice()` method, as well as a `name` property to be used as the injection token. Read more about `ClientsModule`[here](https://docs.nestjs.com/microservices/basics#client).

```

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      },
    ]),
  ]
  ...
})
```

Other options to create a client (either `ClientProxyFactory` or `@Client()`) can be used as well. You can read about them [here](https://docs.nestjs.com/microservices/basics#client).

#### Context[#](https://docs.nestjs.com/microservices/redis#context)

In more complex scenarios, you may need to access additional information about the incoming request. When using the Redis transporter, you can access the `RedisContext` object.

JS TS

```

@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}
```

```

@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(`Channel: ${context.getChannel()}`);
}
```

> **Hint**`@Payload()`, `@Ctx()` and `RedisContext` are imported from the `@nestjs/microservices` package.

#### Wildcards[#](https://docs.nestjs.com/microservices/redis#wildcards)

To enable wildcards support, set the `wildcards` option to `true`. This instructs the transporter to use `psubscribe` and `pmessage` under the hood.

```

const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});
```

Make sure to pass the `wildcards` option when creating a client instance as well.

With this option enabled, you can use wildcards in your message and event patterns. For example, to subscribe to all channels starting with `notifications`, you can use the following pattern:

```

@EventPattern('notifications.*')
```

#### Instance status updates[#](https://docs.nestjs.com/microservices/redis#instance-status-updates)

To get real-time updates on the connection and the state of the underlying driver instance, you can subscribe to the `status` stream. This stream provides status updates specific to the chosen driver. For the Redis driver, the `status` stream emits `connected`, `disconnected`, and `reconnecting` events.

```

this.client.status.subscribe((status: RedisStatus) => {
  console.log(status);
});
```

> **Hint** The `RedisStatus` type is imported from the `@nestjs/microservices` package.

Similarly, you can subscribe to the server's `status` stream to receive notifications about the server's status.

```

const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RedisStatus) => {
  console.log(status);
});
```

#### Listening to Redis events[#](https://docs.nestjs.com/microservices/redis#listening-to-redis-events)

In some cases, you might want to listen to internal events emitted by the microservice. For example, you could listen for the `error` event to trigger additional operations when an error occurs. To do this, use the `on()` method, as shown below:

```

this.client.on('error', (err) => {
  console.error(err);
});
```

Similarly, you can listen to the server's internal events:

```

server.on<RedisEvents>('error', (err) => {
  console.error(err);
});
```

> **Hint** The `RedisEvents` type is imported from the `@nestjs/microservices` package.

#### Underlying driver access[#](https://docs.nestjs.com/microservices/redis#underlying-driver-access)

For more advanced use cases, you may need to access the underlying driver instance. This can be useful for scenarios like manually closing the connection or using driver-specific methods. However, keep in mind that for most cases, you **shouldn't need** to access the driver directly.

To do so, you can use the `unwrap()` method, which returns the underlying driver instance. The generic type parameter should specify the type of driver instance you expect.

```

const [pub, sub] =
  this.client.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();
```

Similarly, you can access the server's underlying driver instance:

```

const [pub, sub] =
  server.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();
```

Note that, in contrary to other transporters, the Redis transporter returns a tuple of two `ioredis` instances: the first one is used for publishing messages, and the second one is used for subscribing to messages.
