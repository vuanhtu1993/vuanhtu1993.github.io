---
title: "Functions: userAgent"
source_url: "https://nextjs.org/docs/app/api-reference/functions/userAgent"
crawled_at: "2026-06-25T07:12:04.104Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/userAgent.md](https://nextjs.org/docs/app/api-reference/functions/userAgent.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

October 17, 2025

The `userAgent` helper extends the [Web Request API](https://developer.mozilla.org/docs/Web/API/Request) with additional properties and methods to interact with the user agent object from the request.

## `isBot`[](#isbot)

A boolean indicating whether the request comes from a known bot.

## `browser`[](#browser)

An object containing information about the browser used in the request.

-   `name`: A string representing the browser's name, or `undefined` if not identifiable.
-   `version`: A string representing the browser's version, or `undefined`.

## `device`[](#device)

An object containing information about the device used in the request.

-   `model`: A string representing the model of the device, or `undefined`.
-   `type`: A string representing the type of the device, such as `console`, `mobile`, `tablet`, `smarttv`, `wearable`, `embedded`, or `undefined`.
-   `vendor`: A string representing the vendor of the device, or `undefined`.

## `engine`[](#engine)

An object containing information about the browser's engine.

-   `name`: A string representing the engine's name. Possible values include: `Amaya`, `Blink`, `EdgeHTML`, `Flow`, `Gecko`, `Goanna`, `iCab`, `KHTML`, `Links`, `Lynx`, `NetFront`, `NetSurf`, `Presto`, `Tasman`, `Trident`, `w3m`, `WebKit` or `undefined`.
-   `version`: A string representing the engine's version, or `undefined`.

## `os`[](#os)

An object containing information about the operating system.

-   `name`: A string representing the name of the OS, or `undefined`.
-   `version`: A string representing the version of the OS, or `undefined`.

## `cpu`[](#cpu)

An object containing information about the CPU architecture.

-   `architecture`: A string representing the architecture of the CPU. Possible values include: `68k`, `amd64`, `arm`, `arm64`, `armhf`, `avr`, `ia32`, `ia64`, `irix`, `irix64`, `mips`, `mips64`, `pa-risc`, `ppc`, `sparc`, `sparc64` or `undefined`

[Previous

useSelectedLayoutSegments

](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segments)[Next

Configuration

](https://nextjs.org/docs/app/api-reference/config)
