---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/security/csrf"
crawled_at: "2026-06-23T15:21:36.074Z"
---

### CSRF Protection

Cross-site request forgery (CSRF or XSRF) is a type of attack where **unauthorized** commands are sent from a trusted user to a web application. To help prevent this, you can use the [csrf-csrf](https://github.com/Psifi-Solutions/csrf-csrf) package.

#### Use with Express (default)[#](https://docs.nestjs.com/security/csrf#use-with-express-default)

Start by installing the required package:

```

$ npm i csrf-csrf
```

> **Warning** As noted in the [csrf-csrf documentation](https://github.com/Psifi-Solutions/csrf-csrf?tab=readme-ov-file#getting-started), this middleware requires session middleware or `cookie-parser` to be initialized beforehand. Please refer to the documentation for further details.

Once the installation is complete, register the `csrf-csrf` middleware as global middleware.

```

import { doubleCsrf } from 'csrf-csrf';
// ...
// somewhere in your initialization file
const {
  invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
  generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);
```

#### Use with Fastify[#](https://docs.nestjs.com/security/csrf#use-with-fastify)

Start by installing the required package:

```

$ npm i --save @fastify/csrf-protection
```

Once the installation is complete, register the `@fastify/csrf-protection` plugin, as follows:

```

import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);
```

> **Warning** As explained in the `@fastify/csrf-protection` docs [here](https://github.com/fastify/csrf-protection#usage), this plugin requires a storage plugin to be initialized first. Please, see that documentation for further instructions.
