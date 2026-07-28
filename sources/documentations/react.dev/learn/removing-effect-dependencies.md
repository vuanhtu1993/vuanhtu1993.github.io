---
title: "Removing Effect Dependencies – React"
source_url: "https://react.dev/learn/removing-effect-dependencies"
crawled_at: "2026-07-28T02:27:09.479Z"
---

When you write an Effect, the linter will verify that you’ve included every reactive value (like props and state) that the Effect reads in the list of your Effect’s dependencies. This ensures that your Effect remains synchronized with the latest props and state of your component. Unnecessary dependencies may cause your Effect to run too often, or even create an infinite loop. Follow this guide to review and remove unnecessary dependencies from your Effects.

### You will learn

-   How to fix infinite Effect dependency loops
-   What to do when you want to remove a dependency
-   How to read a value from your Effect without “reacting” to it
-   How and why to avoid object and function dependencies
-   Why suppressing the dependency linter is dangerous, and what to do instead

## Dependencies should match the code[](#dependencies-should-match-the-code "Link for Dependencies should match the code ")

When you write an Effect, you first specify how to [start and stop](https://react.dev/learn/lifecycle-of-reactive-effects#the-lifecycle-of-an-effect) whatever you want your Effect to be doing:

```
const serverUrl = 'https://localhost:1234';
function ChatRoom({ roomId }) {
useEffect(() => {
const connection = createConnection(serverUrl, roomId);
connection.connect();
return () => connection.disconnect();
// ...
}
```

Then, if you leave the Effect dependencies empty (`[]`), the linter will suggest the correct dependencies:

Fill them in according to what the linter says:

```
function ChatRoom({ roomId }) {
useEffect(() => {
const connection = createConnection(serverUrl, roomId);
connection.connect();
return () => connection.disconnect();
}, [roomId]); // ✅ All dependencies declared
// ...
}
```

[Effects “react” to reactive values.](https://react.dev/learn/lifecycle-of-reactive-effects#effects-react-to-reactive-values) Since `roomId` is a reactive value (it can change due to a re-render), the linter verifies that you’ve specified it as a dependency. If `roomId` receives a different value, React will re-synchronize your Effect. This ensures that the chat stays connected to the selected room and “reacts” to the dropdown:

### To remove a dependency, prove that it’s not a dependency[](#to-remove-a-dependency-prove-that-its-not-a-dependency "Link for To remove a dependency, prove that it’s not a dependency ")

Notice that you can’t “choose” the dependencies of your Effect. Every reactive value used by your Effect’s code must be declared in your dependency list. The dependency list is determined by the surrounding code:

```
const serverUrl = 'https://localhost:1234';
function ChatRoom({ roomId }) { // This is a reactive value
useEffect(() => {
const connection = createConnection(serverUrl, roomId); // This Effect reads that reactive value
connection.connect();
return () => connection.disconnect();
}, [roomId]); // ✅ So you must specify that reactive value as a dependency of your Effect
// ...
}
```

[Reactive values](https://react.dev/learn/lifecycle-of-reactive-effects#all-variables-declared-in-the-component-body-are-reactive) include props and all variables and functions declared directly inside of your component. Since `roomId` is a reactive value, you can’t remove it from the dependency list. The linter wouldn’t allow it:

```
const serverUrl = 'https://localhost:1234';
function ChatRoom({ roomId }) {
useEffect(() => {
const connection = createConnection(serverUrl, roomId);
connection.connect();
return () => connection.disconnect();
}, []); // 🔴 React Hook useEffect has a missing dependency: 'roomId'
// ...
}
```

And the linter would be right! Since `roomId` may change over time, this would introduce a bug in your code.

**To remove a dependency, “prove” to the linter that it _doesn’t need_ to be a dependency.** For example, you can move `roomId` out of your component to prove that it’s not reactive and won’t change on re-renders:

```
const serverUrl = 'https://localhost:1234';
const roomId = 'music'; // Not a reactive value anymore
function ChatRoom() {
useEffect(() => {
const connection = createConnection(serverUrl, roomId);
connection.connect();
return () => connection.disconnect();
}, []); // ✅ All dependencies declared
// ...
}
```

Now that `roomId` is not a reactive value (and can’t change on a re-render), it doesn’t need to be a dependency:

This is why you could now specify an [empty (`[]`) dependency list.](https://react.dev/learn/lifecycle-of-reactive-effects#what-an-effect-with-empty-dependencies-means) Your Effect _really doesn’t_ depend on any reactive value anymore, so it _really doesn’t_ need to re-run when any of the component’s props or state change.

### To change the dependencies, change the code[](#to-change-the-dependencies-change-the-code "Link for To change the dependencies, change the code ")

You might have noticed a pattern in your workflow:

1.  First, you **change the code** of your Effect or how your reactive values are declared.
2.  Then, you follow the linter and adjust the dependencies to **match the code you have changed.**
3.  If you’re not happy with the list of dependencies, you **go back to the first step** (and change the code again).

The last part is important. **If you want to change the dependencies, change the surrounding code first.** You can think of the dependency list as [a list of all the reactive values used by your Effect’s code.](https://react.dev/learn/lifecycle-of-reactive-effects#react-verifies-that-you-specified-every-reactive-value-as-a-dependency) You don’t _choose_ what to put on that list. The list _describes_ your code. To change the dependency list, change the code.

This might feel like solving an equation. You might start with a goal (for example, to remove a dependency), and you need to “find” the code matching that goal. Not everyone finds solving equations fun, and the same thing could be said about writing Effects! Luckily, there is a list of common recipes that you can try below.

### Pitfall

If you have an existing codebase, you might have some Effects that suppress the linter like this:

```
useEffect(() => {
// ...
// 🔴 Avoid suppressing the linter like this:
// eslint-ignore-next-line react-hooks/exhaustive-deps
}, []);
```

**When dependencies don’t match the code, there is a very high risk of introducing bugs.** By suppressing the linter, you “lie” to React about the values your Effect depends on.

Instead, use the techniques below.

##### Deep Dive

#### Why is suppressing the dependency linter so dangerous?[](#why-is-suppressing-the-dependency-linter-so-dangerous "Link for Why is suppressing the dependency linter so dangerous? ")

Suppressing the linter leads to very unintuitive bugs that are hard to find and fix. Here’s one example:

```
import { useState, useEffect } from 'react';

export default function Timer() {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);

  function onTick() {
	setCount(count + increment);
  }

  useEffect(() => {
    const id = setInterval(onTick, 1000);
    return () => clearInterval(id);
    
  }, []);

  return (
    <>
      <h1>
        Counter: {count}
        <button onClick={() => setCount(0)}>Reset</button>
      </h1>
      <hr />
      <p>
        Every second, increment by:
        <button disabled={increment === 0} onClick={() => {
          setIncrement(i => i - 1);
        }}>–</button>
        <b>{increment}</b>
        <button onClick={() => {
          setIncrement(i => i + 1);
        }}>+</button>
      </p>
    </>
  );
}

```

Let’s say that you wanted to run the Effect “only on mount”. You’ve read that [empty (`[]`) dependencies](https://react.dev/learn/lifecycle-of-reactive-effects#what-an-effect-with-empty-dependencies-means) do that, so you’ve decided to ignore the linter, and forcefully specified `[]` as the dependencies.

This counter was supposed to increment every second by the amount configurable with the two buttons. However, since you “lied” to React that this Effect doesn’t depend on anything, React forever keeps using the `onTick` function from the initial render. [During that render,](https://react.dev/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time) `count` was `0` and `increment` was `1`. This is why `onTick` from that render always calls `setCount(0 + 1)` every second, and you always see `1`. Bugs like this are harder to fix when they’re spread across multiple components.

There’s always a better solution than ignoring the linter! To fix this code, you need to add `onTick` to the dependency list. (To ensure the interval is only setup once, [make `onTick` an Effect Event.](https://react.dev/learn/separating-events-from-effects#reading-latest-props-and-state-with-effect-events))

**We recommend treating the dependency lint error as a compilation error. If you don’t suppress it, you will never see bugs like this.** The rest of this page documents the alternatives for this and other cases.

## Removing unnecessary dependencies[](#removing-unnecessary-dependencies "Link for Removing unnecessary dependencies ")

Every time you adjust the Effect’s dependencies to reflect the code, look at the dependency list. Does it make sense for the Effect to re-run when any of these dependencies change? Sometimes, the answer is “no”:

-   You might want to re-execute _different parts_ of your Effect under different conditions.
-   You might want to only read the _latest value_ of some dependency instead of “reacting” to its changes.
-   A dependency may change too often _unintentionally_ because it’s an object or a function.

To find the right solution, you’ll need to answer a few questions about your Effect. Let’s walk through them.

### Should this code move to an event handler?[](#should-this-code-move-to-an-event-handler "Link for Should this code move to an event handler? ")

The first thing you should think about is whether this code should be an Effect at all.

Imagine a form. On submit, you set the `submitted` state variable to `true`. You need to send a POST request and show a notification. You’ve put this logic inside an Effect that “reacts” to `submitted` being `true`:

```
function Form() {
const [submitted, setSubmitted] = useState(false);
useEffect(() => {
if (submitted) {
// 🔴 Avoid: Event-specific logic inside an Effect
post('/api/register');
showNotification('Successfully registered!');
}
}, [submitted]);
function handleSubmit() {
setSubmitted(true);
}
// ...
}
```

Later, you want to style the notification message according to the current theme, so you read the current theme. Since `theme` is declared in the component body, it is a reactive value, so you add it as a dependency:

```
function Form() {
const [submitted, setSubmitted] = useState(false);
const theme = useContext(ThemeContext);
useEffect(() => {
if (submitted) {
// 🔴 Avoid: Event-specific logic inside an Effect
post('/api/register');
showNotification('Successfully registered!', theme);
}
}, [submitted, theme]); // ✅ All dependencies declared
function handleSubmit() {
setSubmitted(true);
}
// ...
}
```

By doing this, you’ve introduced a bug. Imagine you submit the form first and then switch between Dark and Light themes. The `theme` will change, the Effect will re-run, and so it will display the same notification again!

**The problem here is that this shouldn’t be an Effect in the first place.** You want to send this POST request and show the notification in response to _submitting the form,_ which is a particular interaction. To run some code in response to particular interaction, put that logic directly into the corresponding event handler:

```
function Form() {
const theme = useContext(ThemeContext);
function handleSubmit() {
// ✅ Good: Event-specific logic is called from event handlers
post('/api/register');
showNotification('Successfully registered!', theme);
}
// ...
}
```

Now that the code is in an event handler, it’s not reactive—so it will only run when the user submits the form. Read more about [choosing between event handlers and Effects](https://react.dev/learn/separating-events-from-effects#reactive-values-and-reactive-logic) and [how to delete unnecessary Effects.](https://react.dev/learn/you-might-not-need-an-effect)

The next question you should ask yourself is whether your Effect is doing several unrelated things.

Imagine you’re creating a shipping form where the user needs to choose their city and area. You fetch the list of `cities` from the server according to the selected `country` to show them in a dropdown:

```
function ShippingForm({ country }) {
const [cities, setCities] = useState(null);
const [city, setCity] = useState(null);
useEffect(() => {
let ignore = false;
fetch(`/api/cities?country=${country}`)
      .then(response => response.json())
      .then(json => {
if (!ignore) {
setCities(json);
}
});
return () => {
ignore = true;
};
}, [country]); // ✅ All dependencies declared
// ...
```

This is a good example of [fetching data in an Effect.](https://react.dev/learn/you-might-not-need-an-effect#fetching-data) You are synchronizing the `cities` state with the network according to the `country` prop. You can’t do this in an event handler because you need to fetch as soon as `ShippingForm` is displayed and whenever the `country` changes (no matter which interaction causes it).

Now let’s say you’re adding a second select box for city areas, which should fetch the `areas` for the currently selected `city`. You might start by adding a second `fetch` call for the list of areas inside the same Effect:

```
function ShippingForm({ country }) {
const [cities, setCities] = useState(null);
const [city, setCity] = useState(null);
const [areas, setAreas] = useState(null);
useEffect(() => {
let ignore = false;
fetch(`/api/cities?country=${country}`)
      .then(response => response.json())
      .then(json => {
if (!ignore) {
setCities(json);
}
});
// 🔴 Avoid: A single Effect synchronizes two independent processes
if (city) {
fetch(`/api/areas?city=${city}`)
        .then(response => response.json())
        .then(json => {
if (!ignore) {
setAreas(json);
}
});
}
return () => {
ignore = true;
};
}, [country, city]); // ✅ All dependencies declared
// ...
```

However, since the Effect now uses the `city` state variable, you’ve had to add `city` to the list of dependencies. That, in turn, introduced a problem: when the user selects a different city, the Effect will re-run and call `fetchCities(country)`. As a result, you will be unnecessarily refetching the list of cities many times.

**The problem with this code is that you’re synchronizing two different unrelated things:**

1.  You want to synchronize the `cities` state to the network based on the `country` prop.
2.  You want to synchronize the `areas` state to the network based on the `city` state.

Split the logic into two Effects, each of which reacts to the prop that it needs to synchronize with:

```
function ShippingForm({ country }) {
const [cities, setCities] = useState(null);
useEffect(() => {
let ignore = false;
fetch(`/api/cities?country=${country}`)
      .then(response => response.json())
      .then(json => {
if (!ignore) {
setCities(json);
}
});
return () => {
ignore = true;
};
}, [country]); // ✅ All dependencies declared
const [city, setCity] = useState(null);
const [areas, setAreas] = useState(null);
useEffect(() => {
if (city) {
let ignore = false;
fetch(`/api/areas?city=${city}`)
        .then(response => response.json())
        .then(json => {
if (!ignore) {
setAreas(json);
}
});
return () => {
ignore = true;
};
}
}, [city]); // ✅ All dependencies declared
// ...
```

Now the first Effect only re-runs if the `country` changes, while the second Effect re-runs when the `city` changes. You’ve separated them by purpose: two different things are synchronized by two separate Effects. Two separate Effects have two separate dependency lists, so they won’t trigger each other unintentionally.

The final code is longer than the original, but splitting these Effects is still correct. [Each Effect should represent an independent synchronization process.](https://react.dev/learn/lifecycle-of-reactive-effects#each-effect-represents-a-separate-synchronization-process) In this example, deleting one Effect doesn’t break the other Effect’s logic. This means they _synchronize different things,_ and it’s good to split them up. If you’re concerned about duplication, you can improve this code by [extracting repetitive logic into a custom Hook.](https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks)

### Are you reading some state to calculate the next state?[](#are-you-reading-some-state-to-calculate-the-next-state "Link for Are you reading some state to calculate the next state? ")

This Effect updates the `messages` state variable with a newly created array every time a new message arrives:

```
function ChatRoom({ roomId }) {
const [messages, setMessages] = useState([]);
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
setMessages([...messages, receivedMessage]);
});
// ...
```

It uses the `messages` variable to [create a new array](https://react.dev/learn/updating-arrays-in-state) starting with all the existing messages and adds the new message at the end. However, since `messages` is a reactive value read by an Effect, it must be a dependency:

```
function ChatRoom({ roomId }) {
const [messages, setMessages] = useState([]);
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
setMessages([...messages, receivedMessage]);
});
return () => connection.disconnect();
}, [roomId, messages]); // ✅ All dependencies declared
// ...
```

And making `messages` a dependency introduces a problem.

Every time you receive a message, `setMessages()` causes the component to re-render with a new `messages` array that includes the received message. However, since this Effect now depends on `messages`, this will _also_ re-synchronize the Effect. So every new message will make the chat re-connect. The user would not like that!

To fix the issue, don’t read `messages` inside the Effect. Instead, pass an [updater function](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state) to `setMessages`:

```
function ChatRoom({ roomId }) {
const [messages, setMessages] = useState([]);
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
setMessages(msgs => [...msgs, receivedMessage]);
});
return () => connection.disconnect();
}, [roomId]); // ✅ All dependencies declared
// ...
```

**Notice how your Effect does not read the `messages` variable at all now.** You only need to pass an updater function like `msgs => [...msgs, receivedMessage]`. React [puts your updater function in a queue](https://react.dev/learn/queueing-a-series-of-state-updates) and will provide the `msgs` argument to it during the next render. This is why the Effect itself doesn’t need to depend on `messages` anymore. As a result of this fix, receiving a chat message will no longer make the chat re-connect.

### Do you want to read a value without “reacting” to its changes?[](#do-you-want-to-read-a-value-without-reacting-to-its-changes "Link for Do you want to read a value without “reacting” to its changes? ")

Suppose that you want to play a sound when the user receives a new message unless `isMuted` is `true`:

```
function ChatRoom({ roomId }) {
const [messages, setMessages] = useState([]);
const [isMuted, setIsMuted] = useState(false);
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
setMessages(msgs => [...msgs, receivedMessage]);
if (!isMuted) {
playSound();
}
});
// ...
```

Since your Effect now uses `isMuted` in its code, you have to add it to the dependencies:

```
function ChatRoom({ roomId }) {
const [messages, setMessages] = useState([]);
const [isMuted, setIsMuted] = useState(false);
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
setMessages(msgs => [...msgs, receivedMessage]);
if (!isMuted) {
playSound();
}
});
return () => connection.disconnect();
}, [roomId, isMuted]); // ✅ All dependencies declared
// ...
```

The problem is that every time `isMuted` changes (for example, when the user presses the “Muted” toggle), the Effect will re-synchronize, and reconnect to the chat. This is not the desired user experience! (In this example, even disabling the linter would not work—if you do that, `isMuted` would get “stuck” with its old value.)

To solve this problem, you need to extract the logic that shouldn’t be reactive out of the Effect. You don’t want this Effect to “react” to the changes in `isMuted`. [Move this non-reactive piece of logic into an Effect Event:](https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event)

```
import { useState, useEffect, useEffectEvent } from 'react';
function ChatRoom({ roomId }) {
const [messages, setMessages] = useState([]);
const [isMuted, setIsMuted] = useState(false);
const onMessage = useEffectEvent(receivedMessage => {
setMessages(msgs => [...msgs, receivedMessage]);
if (!isMuted) {
playSound();
}
});
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
onMessage(receivedMessage);
});
return () => connection.disconnect();
}, [roomId]); // ✅ All dependencies declared
// ...
```

Effect Events let you split an Effect into reactive parts (which should “react” to reactive values like `roomId` and their changes) and non-reactive parts (which only read their latest values, like `onMessage` reads `isMuted`). **Now that you read `isMuted` inside an Effect Event, it doesn’t need to be a dependency of your Effect.** As a result, the chat won’t re-connect when you toggle the “Muted” setting on and off, solving the original issue!

#### Wrapping an event handler from the props[](#wrapping-an-event-handler-from-the-props "Link for Wrapping an event handler from the props ")

You might run into a similar problem when your component receives an event handler as a prop:

```
function ChatRoom({ roomId, onReceiveMessage }) {
const [messages, setMessages] = useState([]);
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
onReceiveMessage(receivedMessage);
});
return () => connection.disconnect();
}, [roomId, onReceiveMessage]); // ✅ All dependencies declared
// ...
```

Suppose that the parent component passes a _different_ `onReceiveMessage` function on every render:

```
<ChatRoom
roomId={roomId}
onReceiveMessage={receivedMessage => {
// ...
}}
/>
```

Since `onReceiveMessage` is a dependency, it would cause the Effect to re-synchronize after every parent re-render. This would make it re-connect to the chat. To solve this, wrap the call in an Effect Event:

```
function ChatRoom({ roomId, onReceiveMessage }) {
const [messages, setMessages] = useState([]);
const onMessage = useEffectEvent(receivedMessage => {
onReceiveMessage(receivedMessage);
});
useEffect(() => {
const connection = createConnection();
connection.connect();
connection.on('message', (receivedMessage) => {
onMessage(receivedMessage);
});
return () => connection.disconnect();
}, [roomId]); // ✅ All dependencies declared
// ...
```

Effect Events aren’t reactive, so you don’t need to specify them as dependencies. As a result, the chat will no longer re-connect even if the parent component passes a function that’s different on every re-render.

#### Separating reactive and non-reactive code[](#separating-reactive-and-non-reactive-code "Link for Separating reactive and non-reactive code ")

In this example, you want to log a visit every time `roomId` changes. You want to include the current `notificationCount` with every log, but you _don’t_ want a change to `notificationCount` to trigger a log event.

The solution is again to split out the non-reactive code into an Effect Event:

```
function Chat({ roomId, notificationCount }) {
const onVisit = useEffectEvent(visitedRoomId => {
logVisit(visitedRoomId, notificationCount);
});
useEffect(() => {
onVisit(roomId);
}, [roomId]); // ✅ All dependencies declared
// ...
}
```

You want your logic to be reactive with regards to `roomId`, so you read `roomId` inside of your Effect. However, you don’t want a change to `notificationCount` to log an extra visit, so you read `notificationCount` inside of the Effect Event. [Learn more about reading the latest props and state from Effects using Effect Events.](https://react.dev/learn/separating-events-from-effects#reading-latest-props-and-state-with-effect-events)

### Does some reactive value change unintentionally?[](#does-some-reactive-value-change-unintentionally "Link for Does some reactive value change unintentionally? ")

Sometimes, you _do_ want your Effect to “react” to a certain value, but that value changes more often than you’d like—and might not reflect any actual change from the user’s perspective. For example, let’s say that you create an `options` object in the body of your component, and then read that object from inside of your Effect:

```
function ChatRoom({ roomId }) {
// ...
const options = {
serverUrl: serverUrl,
roomId: roomId
};
useEffect(() => {
const connection = createConnection(options);
connection.connect();
// ...
```

This object is declared in the component body, so it’s a [reactive value.](https://react.dev/learn/lifecycle-of-reactive-effects#effects-react-to-reactive-values) When you read a reactive value like this inside an Effect, you declare it as a dependency. This ensures your Effect “reacts” to its changes:

```
// ...
useEffect(() => {
const connection = createConnection(options);
connection.connect();
return () => connection.disconnect();
}, [options]); // ✅ All dependencies declared
// ...
```

It is important to declare it as a dependency! This ensures, for example, that if the `roomId` changes, your Effect will re-connect to the chat with the new `options`. However, there is also a problem with the code above. To see it, try typing into the input in the sandbox below, and watch what happens in the console:

In the sandbox above, the input only updates the `message` state variable. From the user’s perspective, this should not affect the chat connection. However, every time you update the `message`, your component re-renders. When your component re-renders, the code inside of it runs again from scratch.

A new `options` object is created from scratch on every re-render of the `ChatRoom` component. React sees that the `options` object is a _different object_ from the `options` object created during the last render. This is why it re-synchronizes your Effect (which depends on `options`), and the chat re-connects as you type.

**This problem only affects objects and functions. In JavaScript, each newly created object and function is considered distinct from all the others. It doesn’t matter that the contents inside of them may be the same!**

```
// During the first render
const options1 = { serverUrl: 'https://localhost:1234', roomId: 'music' };
// During the next render
const options2 = { serverUrl: 'https://localhost:1234', roomId: 'music' };
// These are two different objects!
console.log(Object.is(options1, options2)); // false
```

**Object and function dependencies can make your Effect re-synchronize more often than you need.**

This is why, whenever possible, you should try to avoid objects and functions as your Effect’s dependencies. Instead, try moving them outside the component, inside the Effect, or extracting primitive values out of them.

#### Move static objects and functions outside your component[](#move-static-objects-and-functions-outside-your-component "Link for Move static objects and functions outside your component ")

If the object does not depend on any props and state, you can move that object outside your component:

```
const options = {
serverUrl: 'https://localhost:1234',
roomId: 'music'
};
function ChatRoom() {
const [message, setMessage] = useState('');
useEffect(() => {
const connection = createConnection(options);
connection.connect();
return () => connection.disconnect();
}, []); // ✅ All dependencies declared
// ...
```

This way, you _prove_ to the linter that it’s not reactive. It can’t change as a result of a re-render, so it doesn’t need to be a dependency. Now re-rendering `ChatRoom` won’t cause your Effect to re-synchronize.

This works for functions too:

```
function createOptions() {
return {
serverUrl: 'https://localhost:1234',
roomId: 'music'
};
}
function ChatRoom() {
const [message, setMessage] = useState('');
useEffect(() => {
const options = createOptions();
const connection = createConnection(options);
connection.connect();
return () => connection.disconnect();
}, []); // ✅ All dependencies declared
// ...
```

Since `createOptions` is declared outside your component, it’s not a reactive value. This is why it doesn’t need to be specified in your Effect’s dependencies, and why it won’t ever cause your Effect to re-synchronize.

#### Move dynamic objects and functions inside your Effect[](#move-dynamic-objects-and-functions-inside-your-effect "Link for Move dynamic objects and functions inside your Effect ")

If your object depends on some reactive value that may change as a result of a re-render, like a `roomId` prop, you can’t pull it _outside_ your component. You can, however, move its creation _inside_ of your Effect’s code:

```
const serverUrl = 'https://localhost:1234';
function ChatRoom({ roomId }) {
const [message, setMessage] = useState('');
useEffect(() => {
const options = {
serverUrl: serverUrl,
roomId: roomId
};
const connection = createConnection(options);
connection.connect();
return () => connection.disconnect();
}, [roomId]); // ✅ All dependencies declared
// ...
```

Now that `options` is declared inside of your Effect, it is no longer a dependency of your Effect. Instead, the only reactive value used by your Effect is `roomId`. Since `roomId` is not an object or function, you can be sure that it won’t be _unintentionally_ different. In JavaScript, numbers and strings are compared by their content:

```
// During the first render
const roomId1 = 'music';
// During the next render
const roomId2 = 'music';
// These two strings are the same!
console.log(Object.is(roomId1, roomId2)); // true
```

Thanks to this fix, the chat no longer re-connects if you edit the input:

However, it _does_ re-connect when you change the `roomId` dropdown, as you would expect.

This works for functions, too:

```
const serverUrl = 'https://localhost:1234';
function ChatRoom({ roomId }) {
const [message, setMessage] = useState('');
useEffect(() => {
function createOptions() {
return {
serverUrl: serverUrl,
roomId: roomId
};
}
const options = createOptions();
const connection = createConnection(options);
connection.connect();
return () => connection.disconnect();
}, [roomId]); // ✅ All dependencies declared
// ...
```

You can write your own functions to group pieces of logic inside your Effect. As long as you also declare them _inside_ your Effect, they’re not reactive values, and so they don’t need to be dependencies of your Effect.

#### Read primitive values from objects[](#read-primitive-values-from-objects "Link for Read primitive values from objects ")

Sometimes, you may receive an object from props:

```
function ChatRoom({ options }) {
const [message, setMessage] = useState('');
useEffect(() => {
const connection = createConnection(options);
connection.connect();
return () => connection.disconnect();
}, [options]); // ✅ All dependencies declared
// ...
```

The risk here is that the parent component will create the object during rendering:

```
<ChatRoom
roomId={roomId}
options={{
serverUrl: serverUrl,
roomId: roomId
}}
/>
```

This would cause your Effect to re-connect every time the parent component re-renders. To fix this, read information from the object _outside_ the Effect, and avoid having object and function dependencies:

```
function ChatRoom({ options }) {
const [message, setMessage] = useState('');
const { roomId, serverUrl } = options;
useEffect(() => {
const connection = createConnection({
roomId: roomId,
serverUrl: serverUrl
});
connection.connect();
return () => connection.disconnect();
}, [roomId, serverUrl]); // ✅ All dependencies declared
// ...
```

The logic gets a little repetitive (you read some values from an object outside an Effect, and then create an object with the same values inside the Effect). But it makes it very explicit what information your Effect _actually_ depends on. If an object is re-created unintentionally by the parent component, the chat would not re-connect. However, if `options.roomId` or `options.serverUrl` really are different, the chat would re-connect.

#### Calculate primitive values from functions[](#calculate-primitive-values-from-functions "Link for Calculate primitive values from functions ")

The same approach can work for functions. For example, suppose the parent component passes a function:

```
<ChatRoom
roomId={roomId}
getOptions={() => {
return {
serverUrl: serverUrl,
roomId: roomId
};
}}
/>
```

To avoid making it a dependency (and causing it to re-connect on re-renders), call it outside the Effect. This gives you the `roomId` and `serverUrl` values that aren’t objects, and that you can read from inside your Effect:

```
function ChatRoom({ getOptions }) {
const [message, setMessage] = useState('');
const { roomId, serverUrl } = getOptions();
useEffect(() => {
const connection = createConnection({
roomId: roomId,
serverUrl: serverUrl
});
connection.connect();
return () => connection.disconnect();
}, [roomId, serverUrl]); // ✅ All dependencies declared
// ...
```

This only works for [pure](https://react.dev/learn/keeping-components-pure) functions because they are safe to call during rendering. If your function is an event handler, but you don’t want its changes to re-synchronize your Effect, [wrap it into an Effect Event instead.](#do-you-want-to-read-a-value-without-reacting-to-its-changes)

## Recap[](#recap "Link for Recap")

-   Dependencies should always match the code.
-   When you’re not happy with your dependencies, what you need to edit is the code.
-   Suppressing the linter leads to very confusing bugs, and you should always avoid it.
-   To remove a dependency, you need to “prove” to the linter that it’s not necessary.
-   If some code should run in response to a specific interaction, move that code to an event handler.
-   If different parts of your Effect should re-run for different reasons, split it into several Effects.
-   If you want to update some state based on the previous state, pass an updater function.
-   If you want to read the latest value without “reacting” it, extract an Effect Event from your Effect.
-   In JavaScript, objects and functions are considered different if they were created at different times.
-   Try to avoid object and function dependencies. Move them outside the component or inside the Effect.
