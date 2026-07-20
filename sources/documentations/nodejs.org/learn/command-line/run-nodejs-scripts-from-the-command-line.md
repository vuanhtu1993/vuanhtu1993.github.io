---
title: "Run Node.js scripts from the command line | Node.js Learn"
source_url: "https://nodejs.org/learn/command-line/run-nodejs-scripts-from-the-command-line"
crawled_at: "2026-07-20T08:07:57.834Z"
---

The usual way to run a Node.js program is to run the globally available `node` command (once you install Node.js) and pass the name of the file you want to execute.

If your main Node.js application file is `app.js`, you can call it by typing:

```
node app.js
```

Above, you are explicitly telling the shell to run your script with `node`. You can also embed this information into your JavaScript file with a ["shebang"](https://en.wikipedia.org/wiki/Shebang_\(Unix\)) line. The "shebang" is the first line in the file, and tells the OS which interpreter to use for running the script. Below is the first line of JavaScript:

```
#!/usr/bin/node
```

Above, we are explicitly giving the absolute path of interpreter. Not all operating systems have `node` in the bin folder, but all should have `env`. You can tell the OS to run `env` with node as parameter:

```
#!/usr/bin/env node

// your javascript code
```

To use a shebang, your file should have executable permission. You can give `app.js` the executable permission by running:

```
chmod u+x app.js
```

While running the command, make sure you are in the same directory which contains the `app.js` file.

## [Pass string as argument to `node` instead of file path](#pass-string-as-argument-to-node-instead-of-file-path)

To execute a string as argument you can use `-e`, `--eval "script"`. Evaluate the following argument as JavaScript. The modules which are predefined in the REPL can also be used in script.

On Windows, using cmd.exe a single quote will not work correctly because it only recognizes double `"` for quoting. In Powershell or Git bash, both `'` and `"` are usable.

```
node -e "console.log(123)"
```

## [Restart the application automatically](#restart-the-application-automatically)

As of Node.js v16, there is a built-in option to automatically restart the application when a file changes. This is useful for development purposes. To use this feature, you need to pass the `--watch` flag to Node.js.

```
node --watch app.js
```

So when you change the file, the application will restart automatically. Read the [`--watch` flag documentation](https://nodejs.org/docs/latest-v22.x/api/cli.html#--watch).

## [Run a task with Node.js](#run-a-task-with-nodejs)

Node.js provides a built-in task runner that allows you to execute specific commands defined in your `package.json` file. This can be particularly useful for automating repetitive tasks such as running tests, building your project, or linting your code.

### [Using the `--run` flag](#-run-flag)

The [`--run`](https://nodejs.org/docs/latest-v22.x/api/cli.html#--run) flag allows you to run a specified command from the `scripts` section of your `package.json` file. For example, if you have the following `package.json`:

```
{
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "test": "node --test"
  }
}
```

You can run the `test` script using the `--run` flag:

```
node --run test
```

### [Passing arguments to the command](#passing-arguments-to-the-command)

You can use the syntax `-- --another-argument` to pass arguments to the underlying script. For example, if you want to pass a `--port` argument to the `start` script:

```
node --run start -- --port 8080
```

This will run the `start` script and append `--port 8080` to the command execution, making it equivalent to running `node app.js --port 8080`.

> Note: Arguments passed after `--` are forwarded to the script and are not interpreted as Node.js CLI flags. For example, `--watch` would not behave like `node --watch app.js` when passed this way.

### [Environment variables](#environment-variables)

The `--run` flag sets specific environment variables that can be useful for your scripts:

-   `NODE_RUN_SCRIPT_NAME`: The name of the script being run.
-   `NODE_RUN_PACKAGE_JSON_PATH`: The path to the `package.json` file being processed.

### [Intentional limitations](#intentional-limitations)

The Node.js task runner is intentionally more limited compared to other task runners like `npm run` or `yarn run`. It focuses on performance and simplicity, omitting features like running `pre` or `post` scripts. This makes it suitable for straightforward tasks but may not cover all use cases.
