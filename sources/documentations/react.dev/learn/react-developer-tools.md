---
title: "React Developer Tools – React"
source_url: "https://react.dev/learn/react-developer-tools"
crawled_at: "2026-07-28T02:22:44.304Z"
---

Use React Developer Tools to inspect React [components](https://react.dev/learn/your-first-component), edit [props](https://react.dev/learn/passing-props-to-a-component) and [state](https://react.dev/learn/state-a-components-memory), and identify performance problems.

### You will learn

-   How to install React Developer Tools

## Browser extension[](#browser-extension "Link for Browser extension ")

The easiest way to debug websites built with React is to install the React Developer Tools browser extension. It is available for several popular browsers:

-   [Install for **Chrome**](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
-   [Install for **Firefox**](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
-   [Install for **Edge**](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)

Now, if you visit a website **built with React,** you will see the _Components_ and _Profiler_ panels.

![React Developer Tools extension](https://res.cloudinary.com/dv3vzmogk/image/upload/v1785205363/aha-mind/docs-crawler/react.dev/react-devtools-extension_ymjxm5.png)

### Safari and other browsers[](#safari-and-other-browsers "Link for Safari and other browsers ")

For other browsers (for example, Safari), install the [`react-devtools`](https://www.npmjs.com/package/react-devtools) npm package:

```
# Yarn
yarn global add react-devtools
# Npm
npm install -g react-devtools
```

Next open the developer tools from the terminal:

```
react-devtools
```

Then connect your website by adding the following `<script>` tag to the beginning of your website’s `<head>`:

```
<html>
<head>
<script src="http://localhost:8097"></script>
```

Reload your website in the browser now to view it in developer tools.

![React Developer Tools standalone](https://res.cloudinary.com/dv3vzmogk/image/upload/v1785205363/aha-mind/docs-crawler/react.dev/react-devtools-standalone_fb8xb7.png)

## Mobile (React Native)[](#mobile-react-native "Link for Mobile (React Native) ")

To inspect apps built with [React Native](https://reactnative.dev/), you can use [React Native DevTools](https://reactnative.dev/docs/react-native-devtools), the built-in debugger that deeply integrates React Developer Tools. All features work identically to the browser extension, including native element highlighting and selection.

[Learn more about debugging in React Native.](https://reactnative.dev/docs/debugging)

> For versions of React Native earlier than 0.76, please use the standalone build of React DevTools by following the [Safari and other browsers](#safari-and-other-browsers) guide above.
