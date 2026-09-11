---
title: "Node.js event loop architecture"
source_url: "https://medium.com/preezma/node-js-event-loop-architecture-go-deeper-node-core-c96b4cec7aa4"
crawled_at: "2026-08-28T05:51:57.441Z"
---

[

![Andranik Keshishyan](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_dmbNkD5D-u45r44go_cf0g_rnzfvh.png)

](https://medium.com/@andranikkeshishyan?source=post_page---byline--c96b4cec7aa4---------------------------------------)

9 min read

Mar 30, 2019

Press enter or click to view image in full size

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_xm_WajiPlaOeJWcqgJb1xQ_m7ahi8.png)

## **Overview**

I believe if you are a Node.js developer, and it doesn’t matter Junior, Mid or Senior level, you already know a lot about Node.js core, the event loop or that Node.js is single-threaded, or how the “setTimeout” or “setimmediate” function will be processed and so on.

Primarily, you know that Node.js uses a non-blocking I/O model and asynchronous programming style. There are, indeed, countless articles or blog posts on this topic by esteemed specialists, but I will dare to assure many of them are subtly wrong or outright misleading, so that they may easily cause misunderstanding, as they appear on the first pages of Google. But which is particularly sad, they may make you believe you have the right knowledge.

So **what is the event loop? Is Node.js single-threaded or multi-threaded?**

Press enter or click to view image in full size

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_UrMrv0zmOuWS9iHz-JpkLw_mgowrs.jpg)

In fact, I am constantly surprised by the unclear or wrong answers on this questions during different discussions at work or on the Web. Once, I even didn’t pass a job interview because my answers did not match those of the interviewer, while he was sure to master that particular topic.

**So the idea of this article is to clarify your notion of Node.js core, how it is implemented and how it works.** Because **Node.js is more than just “JavaScript on the server,”**. Even more, about 30% of it is C++, and not JS! And we are going to discover here what that C++ part actually does in Node.js

> **Is Node.js single-threaded?**

-   Yes! And you are right.
-   No! And You are right again.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_XgTTgtyJE_9hdXrSvXzaAQ_otrhuv.gif)

Also people use many expressions like **multitasking, single-threaded, multi-threaded, thread pool, epoll loop, event loop**, and so on.

**Let’s start from the beginning look up deeper to find out what is going on in Node.js Core?.**

-   A processor can do a single thing at a time or more then one task (program) at a time, running them in parallel (**Multitasking**).

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_hbp6_pL51KF_Hf3AHy7UXg_h1rztv.gif)

When there is a single-core processor, and the processor can process only one task at a time, application calls yield after it has finished, to notify the processor to start process the next task, just like in generator functions in JavaScript, and if not, it will rerun the current task. In the not-so-distant past, computers would become unreachable when a simple application or game were just not able to call yield, because of the application itself becoming unreachable.

-   **Process is a top level execution container. It has his own dedicated memory system.**

That means from one process we can’t directly get a data which is in another process memory, to make two processes communicate. We must do some work that is named inter-process communication ( **IPC )**. It works via system sockets.

[https://en.wikipedia.org/wiki/Inter-process\_communication](https://en.wikipedia.org/wiki/Inter-process_communication)

Work in Unix is based around **sockets**. Socket is a number (an integer) that returns a Socket() system call; it is called socket descriptor or file descriptor.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_rXX6zUdGTZZOkPD_myX7sg_rppdpq.jpg)

Sockets point to Objects in Kernel with a virtual “interface” (read/write/pool/close/etc).

System sockets work like TCP sockets: they convert data into buffer and only then send. As we use JavaScript when making communicate two processes, we must call JSON.stringify many times, but we know how slow it is.

But wait, we have **threads**!

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_nswJ6AtBmNJEF1TPmNvJ5w_meiohn.gif)

Let’s see what it is and how we can make two threads communicate.

-   **Thread of execution is the smallest sequence of programmed instructions that can be managed independently by a scheduler.**

Threads run in processes; one process can have many threads in it, and as they are in same process, they share a memory.

Cool!!!

That means if we want to communicate two threads, we don’t need to do anything. If we host a global variable in one thread, we can access it directly from another thread ( they all keep reference to the same memory, so it is really really performant!).

But let’s imagine that we have a function in one thread which writes in a variable named “foo”, and the other thread reads from it. The question there is what could happen?

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_YCqKJkoz4PT7XkXhRVP4PA_x7ejax.gif)

Actually, **WE DON’T KNOW.** May be the first thread has managed to write in the memory before the other thread would read, maybe no.

So we can get the value that first function has written or no.

That’s why it’s a little bit hard to write code in multi-threading. Let’s see what says Node.js for that.

> **Node.js says: I have one thread**…

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_GDnnkVQS1EssGqcJjVXJ3Q_d5wxb1.gif)

In reality, Node.js has a V8 in it, and the code runs in the main thread where event-loop runs ( **that’s why we say that it is single-threaded**).

But As we know, the Node.js is not just V8. There are many APIs (C++), and all this stuff is managed by **Event Loop**, implemented via libuv (C++).

C++ is working in back of JavaScript code and it has access to threads. If you run the JavaScript synchronous method which has been called from Node.js, it will always run in the main thread. But if you run some asynchronous thing, it will not always run in the main thread: depending on what method you use, the event-loop can route it to one of the APIs and it **can be processed** in another thread.

Let’s see an example CRYPTO. It has many CPU intensive methods; some of them are synchronous, some of them are asynchronous. Let’s take a pbkdf2() method. If we run its synchronous version in 2-Core processor and make 4 calls, and if the execution time of one call is 2ms, the execution time of all 4 calls will be 4\* pbkdf2() execution time (8ms).

But if we run the asynchronous version of this method in the same CPU, the execution time will be 2\* pbkdf2() execution time, because the processor will take **default 4 threads** (you will understand why and how below), host it in two processes and process the pbkdf2() in them.

Press enter or click to view image in full size

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_fBEbMgk6--QtIUUed3KcMQ_tially.png)

**So Node.js runs things in parallel for you, if you give it a chance. “ So use asynchronous methods ”!!!**

Node.js uses a pre-allocated set of threads called a **thread pool**, and if we do not specify how many threads to open, it will open 4 threads by default. We can increase it by setting

UV\_THREADPOOL\_SIZE=110 && node index.js

or

process.env.UV\_THREADPOOL\_SIZE=62 from code.

> **So Is Node.js multi-threaded?**

-   **Hey!!! Node.js works with multiple threads! Yes! Its multi-threaded!**

_So when people ask you is Node multi- or single-threaded,_ **_you must ask a bonus question: “ When?”._**

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_C11TraQ9rcCHQzE15p6lbA_ibff2d.gif)

Let’s take a look to TCP connections.

## Get Andranik Keshishyan’s stories in your inbox

Join Medium for free to get updates from this writer.

Remember me for faster sign in

**Thread per connection**

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_RKOgMIOQ1amPPUU1e261uw_os1ihl.png)

The simple way to create a TCP server is to create a socket, to bind this socket to a port and call “listen” on it.

```
int server = socket();bind(server, 8080);listen(server);
```

Until we call “listen” on it, that socket can be used for making connections or for accepting connections. When we call “listen”, we are ready to accept connections.

```
while(int conn = accept(server)) {  pthread_create(echo, conn)}void echo(int conn) {  char buf(4096);  while(int size = read(conn, buffer, sizeof buf)) {    write(conn, buffer,size);  }}
```

When a connection has arrived and we need to write in it, we can’t accept another connection, until we finish writing, that’s why we push it into another thread. So we pass the socket descriptor and function pointer to the thread.

Now, systems can easily handle a few thousands of threads, but in this case we must send to the thread a lot of data per connection, and it does not scale well to 20–40 thousands of concurrent connections. But let’s think a little bit…

The only thing we actually need is a socket descriptor, and to remember what we must do with that. So there is a better way: we can use **Epoll** (unix), **Kqueue** (BSD).

**Epoll loop**

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_ZbK1ee_TxGn21g1P0fy9Vg_ofu6qy.png)

Let’s focus on Epoll, what can it give us, what’s the reason its use. Using Epoll allows us to tell Kernel in which events we are interested, and Kernel tells as when happen things that we asked about. In our case, it is an incoming TCP connection. So we create an Epoll descriptor and add it to the Epoll loop, call “wait” on it. It wakes up when there is an incoming TCP connenction, then we add it into Epoll loop and wait a data from it and so on. **That is what the event loop is doing for us!**

Let’s take an example:

When we are downloading something via Request (HTTP) on the same 2-Core processor, 4, 6 or even 8 requests, it will take the same time. What does that mean? It means that the limitations are not the same that we have in the thread-pool.

It is because the OS takes care of downloading; we just ask it to download, then asking him: Finished? No? Finished? (listening to “data” event in Epoll).

**API**s

So which API is responsive for which functionality?

Everything in fs.\* uses the uv thread pool (unless they are sync). Blocking calls are made by threads and when completed, signaled back to the event loop. We can’t directly “wait” on them in Epoll, but we can pipe them. Pipe has 2 ends: one is a thread and when it is done, it writes a data in the pipe, the other end is waiting in an Epoll loop and when it gets data, Epoll loop wakes up. So Epoll is responsive for pipes.

The main functions and the APIs responsive for them are below:

EPOOL, KQUEUE, ASYNC, etc. depand on OS

-   TCP/UDP Servers and clients
-   pipes
-   dns.resolve

NGINX

-   nginx signals ( sigterm )
-   Child processes ( exec, spawn)
-   TTY input ( console )

THREAD POOL

-   fs.
-   dns.lookup

And event loop takes care of sending and receiving results, so it is a kind of central dispatch that routes requests to C++ APIs and results back to JavaScript like a director.

**Event loop**

So what is an event loop? It is an infinite while loop, calling Epoll (kqueue) “wait” or “pool”, when something interesting (callback, event, fs) happens for a Node.js; it routs that to Node.js, and exits when there is nothing to wait in Epoll. That is how asynchronous things work in Node.js, and why we call it event-driven. The event loop is what allows Node.js to perform non-blocking I/O operations. Despite the fact that JavaScript is single-threaded by offloading operations to the system Kernel whenever possible.

One iteration of Node.js event loop is called Tick and it has its phases.

Press enter or click to view image in full size

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1787896316/aha-mind/docs-crawler/medium.com/1_RP2rj6fKRFk3VvHQvt2tOw_j76fmj.png)

More details about event loop **phases,** **Timers, and process.nextTick()** in Node.js documentation ( In case You need to read about it ):

[**https://nodejs.org/es/docs/guides/event-loop-timers-and-nexttick/**](https://nodejs.org/es/docs/guides/event-loop-timers-and-nexttick/)

Since the release of [Node.js v10.5.0](https://nodejs.org/en/blog/release/v10.5.0/), there’s a new _worker\_threads_ module available.

The worker\_threads module enables the use of threads that execute JavaScript in parallel. To access it:

Workers (threads) are useful for performing CPU-intensive JavaScript operations. They will not help much with I/O-intensive work. Node.js’s built-in asynchronous I/O operations are more efficient than Workers can be.

Unlike child\_process or cluster, worker\_threads can share memory. They do so by transferring ArrayBuffer instances or sharing SharedArrayBuffer instances.

More details about Worker threads in Node.js documentation:

[**https://nodejs.org/api/worker\_threads.html**](https://nodejs.org/api/worker_threads.html)

If you’ve come this far following the whole article, congratulations 😃 You are awesome.

❤ Thanks for reading and if this post was helpful, please hit the clapp! And don’t forget to check out my other articles, next will be about mongodb sharding. Good luck!
