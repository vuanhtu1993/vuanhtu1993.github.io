---
title: "Accept input from the command line in Node.js | Node.js Learn"
source_url: "https://nodejs.org/learn/command-line/accept-input-from-the-command-line-in-nodejs"
crawled_at: "2026-07-20T08:08:04.751Z"
---

On this page

  

How to make a Node.js CLI program interactive?

Node.js since version 7 provides the [`readline` module](https://nodejs.org/docs/latest-v22.x/api/readline.html) to perform exactly this: get input from a readable stream such as the `process.stdin` stream, which during the execution of a Node.js program is the terminal input, one line at a time.

```
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`What's your name?`, name => {
  console.log(`Hi ${name}!`);
  rl.close();
});
```

JavaScript

This piece of code asks the user's _name_, and once the text is entered and the user presses enter, we send a greeting.

The `question()` method shows the first parameter (a question) and waits for the user input. It calls the callback function once enter is pressed.

In this callback function, we close the readline interface.

`readline` offers several other methods, please check them out on the package documentation linked above.

If you need to require a password, it's best not to echo it back, but instead show a `*` symbol.
