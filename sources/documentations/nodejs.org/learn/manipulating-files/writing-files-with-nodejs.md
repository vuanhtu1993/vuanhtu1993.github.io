---
title: "Writing files with Node.js | Node.js Learn"
source_url: "https://nodejs.org/learn/manipulating-files/writing-files-with-nodejs"
crawled_at: "2026-07-20T08:09:04.902Z"
---

On this page

-   [Writing a file](#writing-a-file)
-   [Writing a file synchronously](#writing-a-file-synchronously)
-   [Appending content to a file](#appending-content-to-a-file)
-   [Examples](#examples)

  

## [Writing a file](#writing-a-file)

The easiest way to write to files in Node.js is to use the `fs.writeFile()` API.

```
const fs = require('node:fs');

const content = 'Some content!';

fs.writeFile('/Users/joe/test.txt', content, err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
});
```

### [Writing a file synchronously](#writing-a-file-synchronously)

Alternatively, you can use the synchronous version `fs.writeFileSync()`:

```
const fs = require('node:fs');

const content = 'Some content!';

try {
  fs.writeFileSync('/Users/joe/test.txt', content);
  // file written successfully
} catch (err) {
  console.error(err);
}
```

You can also use the promise-based `fsPromises.writeFile()` method offered by the `fs/promises` module:

```
const fs = require('node:fs/promises');

async function example() {
  try {
    const content = 'Some content!';
    await fs.writeFile('/Users/joe/test.txt', content);
  } catch (err) {
    console.log(err);
  }
}

example();
```

By default, this API will **replace the contents of the file** if it does already exist.

**You can modify the default by specifying a flag:**

```
fs.writeFile('/Users/joe/test.txt', content, { flag: 'a+' }, err => {});
```

#### [The flags you'll likely use are](#the-flags-youll-likely-use-are)

| Flag | Description | File gets created if it doesn't exist |
| --- | --- | --- |
| `r+` | This flag opens the file for **reading** and **writing** | ❌ |
| `w+` | This flag opens the file for **reading** and **writing** and it also positions the stream at the **beginning** of the file | ✅ |
| `a` | This flag opens the file for **writing** and it also positions the stream at the **end** of the file | ✅ |
| `a+` | This flag opens the file for **reading** and **writing** and it also positions the stream at the **end** of the file | ✅ |

-   You can find more information about the flags in the [fs documentation](https://nodejs.org/api/fs.html#file-system-flags).

## [Appending content to a file](#appending-content-to-a-file)

Appending to files is handy when you don't want to overwrite a file with new content, but rather add to it.

### [Examples](#examples)

A handy method to append content to the end of a file is `fs.appendFile()` (and its `fs.appendFileSync()` counterpart):

```
const fs = require('node:fs');

const content = 'Some content!';

fs.appendFile('file.log', content, err => {
  if (err) {
    console.error(err);
  } else {
    // done!
  }
});
```

#### [Example with Promises](#example-with-promises)

Here is a `fsPromises.appendFile()` example:

```
const fs = require('node:fs/promises');

async function example() {
  try {
    const content = 'Some content!';
    await fs.appendFile('/Users/joe/test.txt', content);
  } catch (err) {
    console.log(err);
  }
}

example();
```
