---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/techniques/streaming-files"
crawled_at: "2026-06-23T15:21:01.402Z"
---

### Streaming files

> **Note** This chapter shows how you can stream files from your **HTTP application**. The examples presented below do not apply to GraphQL or Microservice applications.

There may be times where you would like to send back a file from your REST API to the client. To do this with Nest, normally you'd do the following:

```

@Controller('file')
export class FileController {
  @Get()
  getFile(@Res() res: Response) {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    file.pipe(res);
  }
}
```

But in doing so you end up losing access to your post-controller interceptor logic. To handle this, you can return a `StreamableFile` instance and under the hood, the framework will take care of piping the response.

#### Streamable File class[#](https://docs.nestjs.com/techniques/streaming-files#streamable-file-class)

A `StreamableFile` is a class that holds onto the stream that is to be returned. To create a new `StreamableFile`, you can pass either a `Buffer` or a `Stream` to the `StreamableFile` constructor.

> **hint** The `StreamableFile` class can be imported from `@nestjs/common`.

#### Cross-platform support[#](https://docs.nestjs.com/techniques/streaming-files#cross-platform-support)

Fastify, by default, can support sending files without needing to call `stream.pipe(res)`, so you don't need to use the `StreamableFile` class at all. However, Nest supports the use of `StreamableFile` in both platform types, so if you end up switching between Express and Fastify there's no need to worry about compatibility between the two engines.

#### Example[#](https://docs.nestjs.com/techniques/streaming-files#example)

You can find a simple example of returning the `package.json` as a file instead of a JSON below, but the idea extends out naturally to images, documents, and any other file type.

```

import { Controller, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }
}
```

The default content type (the value for `Content-Type` HTTP response header) is `application/octet-stream`. If you need to customize this value you can use the `type` option from `StreamableFile`, or use the `res.set` method or the [`@Header()`](https://docs.nestjs.com/controllers#response-headers) decorator, like this:

```

import { Controller, Get, StreamableFile, Res } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express'; // Assuming that we are using the ExpressJS HTTP Adapter

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file, {
      type: 'application/json',
      disposition: 'attachment; filename="package.json"',
      // If you want to define the Content-Length value to another value instead of file's length:
      // length: 123,
    });
  }

  // Or even:
  @Get()
  getFileChangingResponseObjDirectly(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });
    return new StreamableFile(file);
  }

  // Or even:
  @Get()
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getFileUsingStaticValues(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }  
}
```
