---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/recipes/swc"
crawled_at: "2026-06-23T15:24:19.315Z"
---

### SWC

[SWC](https://swc.rs/) (Speedy Web Compiler) is an extensible Rust-based platform that can be used for both compilation and bundling. Using SWC with Nest CLI is a great and simple way to significantly speed up your development process.

> **Hint** SWC is approximately **x20 times faster** than the default TypeScript compiler.

#### Installation[#](https://docs.nestjs.com/recipes/swc#installation)

To get started, first install a few packages:

```

$ npm i --save-dev @swc/cli @swc/core
```

#### Getting started[#](https://docs.nestjs.com/recipes/swc#getting-started)

Once the installation process is complete, you can use the `swc` builder with Nest CLI, as follows:

```

$ nest start -b swc
# OR nest start --builder swc
```

> **Hint** If your repository is a monorepo, check out [this section](https://docs.nestjs.com/recipes/swc#monorepo).

Instead of passing the `-b` flag you can also just set the `compilerOptions.builder` property to `"swc"` in your `nest-cli.json` file, like so:

```

{
  "compilerOptions": {
    "builder": "swc"
  }
}
```

To customize builder's behavior, you can pass an object containing two attributes, `type` (`"swc"`) and `options`, as follows:

```

{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc",
      }
    }
  }
}
```

For example, to make the swc compile `.jsx` and `.tsx` files, do:

```

{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": { "extensions": [".ts", ".tsx", ".js", ".jsx"] }
    },
  }
}
```

To run the application in watch mode, use the following command:

```

$ nest start -b swc -w
# OR nest start --builder swc --watch
```

#### Type checking[#](https://docs.nestjs.com/recipes/swc#type-checking)

SWC does not perform any type checking itself (as opposed to the default TypeScript compiler), so to turn it on, you need to use the `--type-check` flag:

```

$ nest start -b swc --type-check
```

This command will instruct the Nest CLI to run `tsc` in `noEmit` mode alongside SWC, which will asynchronously perform type checking. Again, instead of passing the `--type-check` flag you can also just set the `compilerOptions.typeCheck` property to `true` in your `nest-cli.json` file, like so:

```

{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": true
  }
}
```

#### CLI Plugins (SWC)[#](https://docs.nestjs.com/recipes/swc#cli-plugins-swc)

The `--type-check` flag will automatically execute **NestJS CLI plugins** and produce a serialized metadata file which then can be loaded by the application at runtime.

#### SWC configuration[#](https://docs.nestjs.com/recipes/swc#swc-configuration)

SWC builder is pre-configured to match the requirements of NestJS applications. However, you can customize the configuration by creating a `.swcrc` file in the root directory and tweaking the options as you wish.

```

{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "baseUrl": "./"
  },
  "minify": false
}
```

#### Monorepo[#](https://docs.nestjs.com/recipes/swc#monorepo)

If your repository is a monorepo, then instead of using `swc` builder you have to configure `webpack` to use `swc-loader`.

First, let's install the required package:

```

$ npm i --save-dev swc-loader
```

Once the installation is complete, create a `webpack.config.js` file in the root directory of your application with the following content:

```

const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig,
        },
      },
    ],
  },
};
```

#### Monorepo and CLI plugins[#](https://docs.nestjs.com/recipes/swc#monorepo-and-cli-plugins)

Now if you use CLI plugins, `swc-loader` will not load them automatically. Instead, you have to create a separate file that will load them manually. To do so, declare a `generate-metadata.ts` file near the `main.ts` file with the following content:

```

import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: 'apps/<name>/tsconfig.app.json',
});
```

> **Hint** In this example we used `@nestjs/swagger` plugin, but you can use any plugin of your choice.

The `generate()` method accepts the following options:

<table><thead></thead><tbody><tr><td><code>watch</code></td><td>Whether to watch the project for changes.</td></tr><tr><td><code>tsconfigPath</code></td><td>Path to the <code>tsconfig.json</code> file. Relative to the current working directory (<code>process.cwd()</code>).</td></tr><tr><td><code>outputDir</code></td><td>Path to the directory where the metadata file will be saved.</td></tr><tr><td><code>visitors</code></td><td>An array of visitors that will be used to generate metadata.</td></tr><tr><td><code>filename</code></td><td>The name of the metadata file. Defaults to <code>metadata.ts</code>.</td></tr><tr><td><code>printDiagnostics</code></td><td>Whether to print diagnostics to the console. Defaults to <code>true</code>.</td></tr></tbody></table>

Finally, you can run the `generate-metadata` script in a separate terminal window with the following command:

```

$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```

#### Common pitfalls[#](https://docs.nestjs.com/recipes/swc#common-pitfalls)

If you use TypeORM/MikroORM or any other ORM in your application, you may stumble upon circular import issues. SWC doesn't handle **circular imports** well, so you should use the following workaround:

```

@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}
```

> **Hint**`Relation` type is exported from the `typeorm` package.

Doing this prevents the type of the property from being saved in the transpiled code in the property metadata, preventing circular dependency issues.

If your ORM does not provide a similar workaround, you can define the wrapper type yourself:

```

/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type WrapperType<T> = T; // WrapperType === Relation
```

For all [circular dependency injections](https://docs.nestjs.com/fundamentals/circular-dependency) in your project, you will also need to use the custom wrapper type described above:

```

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: WrapperType<ProfileService>,
  ) {};
}
```

### Jest + SWC

To use SWC with Jest, you need to install the following packages:

```

$ npm i --save-dev jest @swc/core @swc/jest
```

Once the installation is complete, update the `package.json`/`jest.config.js` file (depending on your configuration) with the following content:

```

{
  "jest": {
    "transform": {
      "^.+\\.(t|j)s?$": ["@swc/jest"]
    }
  }
}
```

Additionally you would need to add the following `transform` properties to your `.swcrc` file: `legacyDecorator`, `decoratorMetadata`:

```

{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    },
    "baseUrl": "./"
  },
  "minify": false
}
```

If you use NestJS CLI Plugins in your project, you'll have to run `PluginMetadataGenerator` manually. Navigate to [this section](https://docs.nestjs.com/recipes/swc#monorepo-and-cli-plugins) to learn more.

### Vitest

[Vitest](https://vitest.dev/) is a fast and lightweight test runner designed to work with Vite. It provides a modern, fast, and easy-to-use testing solution that can be integrated with NestJS projects.

#### Installation[#](https://docs.nestjs.com/recipes/swc#installation-1)

To get started, first install the required packages:

```

$ npm i --save-dev vitest unplugin-swc @swc/core @vitest/coverage-v8
```

#### Configuration[#](https://docs.nestjs.com/recipes/swc#configuration)

Create a `vitest.config.ts` file in the root directory of your application with the following content:

```

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      'src': resolve(__dirname, './src'),
    },
  },
});
```

This configuration file sets up the Vitest environment, root directory, and SWC plugin. You should also create a separate configuration file for e2e tests, with an additional `include` field that specifies the test path regex:

```

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  plugins: [swc.vite()],
});
```

Additionally, you can set the `alias` options to support TypeScript paths in your tests:

```

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    alias: {
      '@src': './src',
      '@test': './test',
    },
    root: './',
  },
  resolve: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
  plugins: [swc.vite()],
});
```

### Path aliases

Unlike Jest, Vitest does not automatically resolve TypeScript path aliases like `src/`. This may lead to dependency resolution errors during testing. To resolve this issue, add the following `resolve.alias` configuration in your `vitest.config.ts` file:

```

import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
    },
  },
});
```

This ensures that Vitest correctly resolves module imports, preventing errors related to missing dependencies.

#### Update imports in E2E tests[#](https://docs.nestjs.com/recipes/swc#update-imports-in-e2e-tests)

Change any E2E test imports using `import * as request from 'supertest'` to `import request from 'supertest'`. This is necessary because Vitest, when bundled with Vite, expects a default import for supertest. Using a namespace import may cause issues in this specific setup.

Lastly, update the test scripts in your package.json file to the following:

```

{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:debug": "vitest --inspect-brk --inspect --logHeapUsage --threads=false",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts"
  }
}
```

These scripts configure Vitest for running tests, watching for changes, generating code coverage reports, and debugging. The test:e2e script is specifically for running E2E tests with a custom configuration file.

With this setup, you can now enjoy the benefits of using Vitest in your NestJS project, including faster test execution and a more modern testing experience.

> **Hint** You can check out a working example in this [repository](https://github.com/TrilonIO/nest-vitest)
