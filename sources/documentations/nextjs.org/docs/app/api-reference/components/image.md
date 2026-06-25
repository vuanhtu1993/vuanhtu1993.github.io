---
title: "Components: Image Component"
source_url: "https://nextjs.org/docs/app/api-reference/components/image"
crawled_at: "2026-06-25T07:04:37.359Z"
---

Last updated

March 10, 2026

The Next.js Image component extends the HTML `<img>` element for automatic image optimization.

## Reference[](#reference)

### Props[](#props)

The following props are available:

| Prop | Example | Type | Status |
| --- | --- | --- | --- |
| [`src`](#src) | `src="/profile.png"` | String | Required |
| [`alt`](#alt) | `alt="Picture of the author"` | String | Required |
| [`width`](#width-and-height) | `width={500}` | Integer (px) | \- |
| [`height`](#width-and-height) | `height={500}` | Integer (px) | \- |
| [`fill`](#fill) | `fill={true}` | Boolean | \- |
| [`loader`](#loader) | `loader={imageLoader}` | Function | \- |
| [`sizes`](#sizes) | `sizes="(max-width: 768px) 100vw, 33vw"` | String | \- |
| [`quality`](#quality) | `quality={80}` | Integer (1-100) | \- |
| [`preload`](#preload) | `preload={true}` | Boolean | \- |
| [`placeholder`](#placeholder) | `placeholder="blur"` | String | \- |
| [`style`](#style) | `style={{objectFit: "contain"}}` | Object | \- |
| [`onLoadingComplete`](#onloadingcomplete) | `onLoadingComplete={img => done())}` | Function | Deprecated |
| [`onLoad`](#onload) | `onLoad={event => done())}` | Function | \- |
| [`onError`](#onerror) | `onError(event => fail()}` | Function | \- |
| [`loading`](#loading) | `loading="lazy"` | String | \- |
| [`blurDataURL`](#blurdataurl) | `blurDataURL="data:image/jpeg..."` | String | \- |
| [`unoptimized`](#unoptimized) | `unoptimized={true}` | Boolean | \- |
| [`overrideSrc`](#overridesrc) | `overrideSrc="/seo.png"` | String | \- |
| [`decoding`](#decoding) | `decoding="async"` | String | \- |

#### `src`[](#src)

The source of the image. Can be one of the following:

An internal path string.

An absolute external URL (must be configured with [remotePatterns](#remotepatterns)).

A static import.

> **Good to know**: For security reasons, the Image Optimization API using the default [loader](#loader) will _not_ forward headers when fetching the `src` image. If the `src` image requires authentication, consider using the [unoptimized](#unoptimized) property to disable Image Optimization.

#### `alt`[](#alt)

The `alt` property is used to describe the image for screen readers and search engines. It is also the fallback text if images have been disabled or an error occurs while loading the image.

It should contain text that could replace the image [without changing the meaning of the page](https://html.spec.whatwg.org/multipage/images.html#general-guidelines). It is not meant to supplement the image and should not repeat information that is already provided in the captions above or below the image.

If the image is [purely decorative](https://html.spec.whatwg.org/multipage/images.html#a-purely-decorative-image-that-doesn't-add-any-information) or [not intended for the user](https://html.spec.whatwg.org/multipage/images.html#an-image-not-intended-for-the-user), the `alt` property should be an empty string (`alt=""`).

> Learn more about [image accessibility guidelines](https://html.spec.whatwg.org/multipage/images.html#alt).

#### `width` and `height`[](#width-and-height)

The `width` and `height` properties represent the [intrinsic](https://developer.mozilla.org/en-US/docs/Glossary/Intrinsic_Size) image size in pixels. This property is used to infer the correct **aspect ratio** used by browsers to reserve space for the image and avoid layout shift during loading. It does not determine the _rendered size_ of the image, which is controlled by CSS.

You **must** set both `width` and `height` properties unless:

-   The image is statically imported.
-   The image has the [`fill` property](#fill)

If the height and width are unknown, we recommend using the [`fill` property](#fill).

#### `fill`[](#fill)

A boolean that causes the image to expand to the size of the parent element.

**Positioning**:

-   The parent element **must** assign `position: "relative"`, `"fixed"`, `"absolute"`.
-   By default, the `<img>` element uses `position: "absolute"`.

**Object Fit**:

If no styles are applied to the image, the image will stretch to fit the container. You can use `objectFit` to control cropping and scaling.

-   `"contain"`: The image will be scaled down to fit the container and preserve aspect ratio.
-   `"cover"`: The image will fill the container and be cropped.

> Learn more about [`position`](https://developer.mozilla.org/en-US/docs/Web/CSS/position) and [`object-fit`](https://developer.mozilla.org/docs/Web/CSS/object-fit).

#### `loader`[](#loader)

A custom function used to generate the image URL. The function receives the following parameters, and returns a URL string for the image:

-   [`src`](#src)
-   [`width`](#width-and-height)
-   [`quality`](#quality)

> **Good to know**: Using props like `onLoad`, which accept a function, requires using [Client Components](https://react.dev/reference/rsc/use-client) to serialize the provided function.

Alternatively, you can use the [loaderFile](#loaderfile) configuration in `next.config.js` to configure every instance of `next/image` in your application, without passing a prop.

#### `sizes`[](#sizes)

Define the sizes of the image at different breakpoints. Used by the browser to choose the most appropriate size from the generated `srcset`.

`sizes` should be used when:

-   The image is using the [`fill`](#fill) prop
-   CSS is used to make the image responsive

If `sizes` is missing, the browser assumes the image will be as wide as the viewport (`100vw`). This can cause unnecessarily large images to be downloaded.

In addition, `sizes` affects how `srcset` is generated:

-   Without `sizes`: Next.js generates a limited `srcset` (e.g. 1x, 2x), suitable for fixed-size images.
-   With `sizes`: Next.js generates a full `srcset` (e.g. 640w, 750w, etc.), optimized for responsive layouts.

> Learn more about `srcset` and `sizes` on [web.dev](https://web.dev/learn/design/responsive-images/#sizes) and [mdn](https://developer.mozilla.org/docs/Web/HTML/Element/img#sizes).

#### `quality`[](#quality)

An integer between `1` and `100` that sets the quality of the optimized image. Higher values increase file size and visual fidelity. Lower values reduce file size but may affect sharpness.

If you’ve configured [qualities](#qualities) in `next.config.js`, the value must match one of the allowed entries.

> **Good to know**: If the original image is already low quality, setting a high quality value will increase the file size without improving appearance.

#### `style`[](#style)

Allows passing CSS styles to the underlying image element.

> **Good to know**: If you’re using the `style` prop to set a custom width, be sure to also set `height: 'auto'` to preserve the image’s aspect ratio.

#### `preload`[](#preload)

A boolean that indicates if the image should be preloaded.

-   `true`: [Preloads](https://web.dev/preload-responsive-images/) the image by inserting a `<link>` in the `<head>`.
-   `false`: Does not preload the image.

**When to use it:**

-   The image is the [Largest Contentful Paint (LCP)](https://nextjs.org/learn/seo/web-performance/lcp) element.
-   The image is above the fold, typically the hero image.
-   You want to begin loading the image in the `<head>`, before its discovered later in the `<body>`.

**When not to use it:**

-   When you have multiple images that could be considered the [Largest Contentful Paint (LCP)](https://nextjs.org/learn/seo/web-performance/lcp) element depending on the viewport.
-   When the `loading` property is used.
-   When the `fetchPriority` property is used.

In most cases, you should use `loading="eager"` or `fetchPriority="high"` instead of `preload`.

#### `priority`[](#priority)

Starting with Next.js 16, the `priority` property has been deprecated in favor of the [`preload`](#preload) property in order to make the behavior clear.

#### `loading`[](#loading)

Controls when the image should start loading.

-   `lazy`: Defer loading the image until it reaches a calculated distance from the viewport.
-   `eager`: Load the image immediately, regardless of its position in the page.

Use `eager` only when you want to ensure the image is loaded immediately.

> Learn more about the [`loading` attribute](https://developer.mozilla.org/docs/Web/HTML/Element/img#loading).

#### `placeholder`[](#placeholder)

Specifies a placeholder to use while the image is loading, improving the perceived loading performance.

-   `empty`: No placeholder while the image is loading.
-   `blur`: Use a blurred version of the image as a placeholder. Must be used with the [`blurDataURL`](#blurdataurl) property.
-   `data:image/...`: Uses the [Data URL](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) as the placeholder.

**Examples:**

-   [`blur` placeholder](https://image-component.nextjs.gallery/placeholder)
-   [Shimmer effect with data URL `placeholder` prop](https://image-component.nextjs.gallery/shimmer)
-   [Color effect with `blurDataURL` prop](https://image-component.nextjs.gallery/color)

> Learn more about the [`placeholder` attribute](https://developer.mozilla.org/docs/Web/HTML/Element/img#placeholder).

#### `blurDataURL`[](#blurdataurl)

A [Data URL](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) to be used as a placeholder image before the image successfully loads. Can be automatically set or used with the [`placeholder="blur"`](#placeholder) property.

The image is automatically enlarged and blurred, so a very small image (10px or less) is recommended.

**Automatic**

If `src` is a static import of a `jpg`, `png`, `webp`, or `avif` file, `blurDataURL` is added automatically—unless the image is animated.

**Manually set**

If the image is dynamic or remote, you must provide `blurDataURL` yourself. To generate one, you can use:

-   [A online tool like png-pixel.com](https://png-pixel.com/)
-   [A library like Plaiceholder](https://github.com/joe-bell/plaiceholder)

A large blurDataURL may hurt performance. Keep it small and simple.

**Examples:**

-   [Default `blurDataURL` prop](https://image-component.nextjs.gallery/placeholder)
-   [Color effect with `blurDataURL` prop](https://image-component.nextjs.gallery/color)

#### `onLoad`[](#onload)

A callback function that is invoked once the image is completely loaded and the [placeholder](#placeholder) has been removed.

The callback function will be called with one argument, the event which has a `target` that references the underlying `<img>` element.

> **Good to know**: Using props like `onLoad`, which accept a function, requires using [Client Components](https://react.dev/reference/rsc/use-client) to serialize the provided function.

#### `onError`[](#onerror)

A callback function that is invoked if the image fails to load.

> **Good to know**: Using props like `onError`, which accept a function, requires using [Client Components](https://react.dev/reference/rsc/use-client) to serialize the provided function.

#### `unoptimized`[](#unoptimized)

A boolean that indicates if the image should be optimized. This is useful for images that do not benefit from optimization such as small images (less than 1KB), vector images (SVG), or animated images (GIF).

-   `true`: The source image will be served as-is from the `src` instead of changing quality, size, or format.
-   `false`: The source image will be optimized.

Since Next.js 12.3.0, this prop can be assigned to all images by updating `next.config.js` with the following configuration:

#### `overrideSrc`[](#overridesrc)

When providing the `src` prop to the `<Image>` component, both the `srcset` and `src` attributes are generated automatically for the resulting `<img>`.

In some cases, it is not desirable to have the `src` attribute generated and you may wish to override it using the `overrideSrc` prop.

For example, when upgrading an existing website from `<img>` to `<Image>`, you may wish to maintain the same `src` attribute for SEO purposes such as image ranking or avoiding recrawl.

#### `decoding`[](#decoding)

A hint to the browser indicating if it should wait for the image to be decoded before presenting other content updates or not.

-   `async`: Asynchronously decode the image and allow other content to be rendered before it completes.
-   `sync`: Synchronously decode the image for atomic presentation with other content.
-   `auto`: No preference. The browser chooses the best approach.

> Learn more about the [`decoding` attribute](https://developer.mozilla.org/docs/Web/HTML/Element/img#decoding).

### Other Props[](#other-props)

Other properties on the `<Image />` component will be passed to the underlying `img` element with the exception of the following:

-   `srcSet`: Use [Device Sizes](#devicesizes) instead.

### Deprecated props[](#deprecated-props)

#### `onLoadingComplete`[](#onloadingcomplete)

> **Warning**: Deprecated in Next.js 14, use [`onLoad`](#onload) instead.

A callback function that is invoked once the image is completely loaded and the [placeholder](#placeholder) has been removed.

The callback function will be called with one argument, a reference to the underlying `<img>` element.

> **Good to know**: Using props like `onLoadingComplete`, which accept a function, requires using [Client Components](https://react.dev/reference/rsc/use-client) to serialize the provided function.

### Configuration options[](#configuration-options)

You can configure the Image Component in `next.config.js`. The following options are available:

#### `localPatterns`[](#localpatterns)

Use `localPatterns` in your `next.config.js` file to allow images from specific local paths to be optimized and block all others.

The example above will ensure the `src` property of `next/image` must start with `/assets/images/` and must not have a query string. Attempting to optimize any other path will respond with `400` Bad Request error.

> **Good to know**: Omitting the `search` property allows all search parameters which could allow malicious actors to optimize URLs you did not intend. Try using a specific value like `search: '?v=2'` to ensure an exact match.

#### `remotePatterns`[](#remotepatterns)

Use `remotePatterns` in your `next.config.js` file to allow images from specific external paths and block all others. This ensures that only external images from your account can be served.

You can also configure `remotePatterns` using the object:

The example above will ensure the `src` property of `next/image` must start with `https://example.com/account123/` and must not have a query string. Any other protocol, hostname, port, or unmatched path will respond with `400` Bad Request.

**Wildcard Patterns:**

Wildcard patterns can be used for both `pathname` and `hostname` and have the following syntax:

-   `*` match a single path segment or subdomain
-   `**` match any number of path segments at the end or subdomains at the beginning. This syntax does not work in the middle of the pattern.

This allows subdomains like `image.example.com`. Query strings and custom ports are still blocked.

> **Good to know**: When omitting `protocol`, `port`, `pathname`, or `search` then the wildcard `**` is implied. This is not recommended because it may allow malicious actors to optimize urls you did not intend.

**Query Strings**:

You can also restrict query strings using the `search` property:

The example above will ensure the `src` property of `next/image` must start with `https://assets.example.com` and must have the exact query string `?v=1727111025337`. Any other protocol or query string will respond with `400` Bad Request.

Note that any allowed `remotePatterns` that respond with a redirect will follow the redirect from the remote image server without validating `remotePatterns` again on the redirect location. You can reduce or disable redirects by configuring [maximumRedirects](#maximumredirects).

#### `loaderFile`[](#loaderfile)

`loaderFiles` allows you to use a custom image optimization service instead of Next.js.

The path must be relative to the project root. The file must export a default function that returns a URL string:

**Example:**

-   [Custom Image Loader Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/images#example-loader-configuration)

> Alternatively, you can use the [`loader` prop](#loader) to configure each instance of `next/image`.

#### `path`[](#path)

If you want to change or prefix the default path for the Image Optimization API, you can do so with the `path` property. The default value for `path` is `/_next/image`.

#### `deviceSizes`[](#devicesizes)

`deviceSizes` allows you to specify a list of device width breakpoints. These widths are used when the `next/image` component uses [`sizes`](#sizes) prop to ensure the correct image is served for the user's device.

If no configuration is provided, the default below is used:

#### `imageSizes`[](#imagesizes)

`imageSizes` allows you to specify a list of image widths. These widths are concatenated with the array of [device sizes](#devicesizes) to form the full array of sizes used to generate image [srcset](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/srcset).

If no configuration is provided, the default below is used:

`imageSizes` is only used for images which provide a [`sizes`](#sizes) prop, which indicates that the image is less than the full width of the screen. Therefore, the sizes in `imageSizes` should all be smaller than the smallest size in `deviceSizes`.

#### `qualities`[](#qualities)

`qualities` allows you to specify a list of image quality values.

If not configuration is provided, the default below is used:

> **Good to know**: This field is required starting with Next.js 16 because unrestricted access could allow malicious actors to optimize more qualities than you intended.

You can add more image qualities to the allowlist, such as the following:

In the example above, only four qualities are allowed: 25, 50, 75, and 100.

If the [`quality`](#quality) prop does not match a value in this array, the closest allowed value will be used.

If the REST API is visited directly with a quality that does not match a value in this array, the server will return a 400 Bad Request response.

#### `formats`[](#formats)

`formats` allows you to specify a list of image formats to be used.

Next.js automatically detects the browser's supported image formats via the request's `Accept` header in order to determine the best output format.

If the `Accept` header matches more than one of the configured formats, the first match in the array is used. Therefore, the array order matters. If there is no match (or the source image is animated), it will use the original image's format.

You can enable AVIF support, which will fallback to the original format of the src image if the browser [does not support AVIF](https://caniuse.com/avif):

You can also enable both AVIF and WebP formats together. AVIF will be preferred for browsers that support it, with WebP as a fallback:

> **Good to know**:
> 
> -   We still recommend using WebP for most use cases.
> -   AVIF generally takes 50% longer to encode but it compresses 20% smaller compared to WebP. This means that the first time an image is requested, it will typically be slower, but subsequent requests that are cached will be faster.
> -   When using multiple formats, Next.js will cache each format separately. This means increased storage requirements compared to using a single format, as both AVIF and WebP versions of images will be stored for different browser support.
> -   If you self-host with a Proxy/CDN in front of Next.js, you must configure the Proxy to forward the `Accept` header.

#### `minimumCacheTTL`[](#minimumcachettl)

`minimumCacheTTL` allows you to configure the Time to Live (TTL) in seconds for cached optimized images. In many cases, it's better to use a [Static Image Import](https://nextjs.org/docs/app/getting-started/images#local-images) which will automatically hash the file contents and cache the image forever with a `Cache-Control` header of `immutable`.

If no configuration is provided, the default below is used.

You can increase the TTL to reduce the number of revalidations and potentially lower cost:

The expiration (or rather Max Age) of the optimized image is defined by either the `minimumCacheTTL` or the upstream image `Cache-Control` header, whichever is larger.

If you need to change the caching behavior per image, you can configure [`headers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers) to set the `Cache-Control` header on the upstream image (e.g. `/some-asset.jpg`, not `/_next/image` itself).

There is no mechanism to invalidate the cache at this time, so its best to keep `minimumCacheTTL` low. Otherwise you may need to manually change the [`src`](#src) prop or delete the cached file `<distDir>/cache/images`.

#### `disableStaticImages`[](#disablestaticimages)

`disableStaticImages` allows you to disable static image imports.

The default behavior allows you to import static files such as `import icon from './icon.png'` and then pass that to the `src` property. In some cases, you may wish to disable this feature if it conflicts with other plugins that expect the import to behave differently.

You can disable static image imports inside your `next.config.js`:

#### `maximumRedirects`[](#maximumredirects)

The default image optimization loader will follow HTTP redirects when fetching remote images up to 3 times.

For your convenience, these redirects do not need to satisfy [remotePatterns](#remotepatterns).

You can configure the number of redirects to follow when fetching remote images. Setting the value to `0` will disable following redirects.

#### `maximumDiskCacheSize`[](#maximumdiskcachesize)

The default image optimization loader will write optimized images to disk so subsequent requests can be served faster from the disk cache.

You can configure the maximum disk cache size in bytes, for example 500 MB:

You can also disable the disk cache entirely by setting the value to `0`.

If no value is configured, the default behavior is to check the current available disk space once during startup and use 50%.

When the disk cache exceeds the configured size, the least recently used optimized images will be deleted until the cache is under the limit again.

Alternatively, you can implement your own cache handler using [`cacheHandler`](https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath) which will ignore the `maximumDiskCacheSize` configuration.

#### `maximumResponseBody`[](#maximumresponsebody)

The default image optimization loader will fetch source images up to 50 MB in size.

If you know all your source images are small, you can protect memory constrained servers by reducing this to a smaller value such as 5 MB.

#### `dangerouslyAllowLocalIP`[](#dangerouslyallowlocalip)

In rare cases when self-hosting Next.js on a private network, you may want to allow optimizing images from local IP addresses on the same network. This is not recommended for most users because it could allow malicious users to access content on your internal network.

By default, the value is false.

If you need to optimize remote images hosted elsewhere in your local network, you can set the value to true.

#### `dangerouslyAllowSVG`[](#dangerouslyallowsvg)

`dangerouslyAllowSVG` allows you to serve SVG images.

By default, Next.js does not optimize SVG images for a few reasons:

-   SVG is a vector format meaning it can be resized losslessly.
-   SVG has many of the same features as HTML/CSS, which can lead to vulnerabilities without proper [Content Security Policy (CSP) headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers#content-security-policy).

We recommend using the [`unoptimized`](#unoptimized) prop when the [`src`](#src) prop is known to be SVG. This happens automatically when `src` ends with `".svg"`.

In addition, it is strongly recommended to also set `contentDispositionType` to force the browser to download the image, as well as `contentSecurityPolicy` to prevent scripts embedded in the image from executing.

#### `contentDispositionType`[](#contentdispositiontype)

`contentDispositionType` allows you to configure the [`Content-Disposition`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition#as_a_response_header_for_the_main_body) header.

#### `contentSecurityPolicy`[](#contentsecuritypolicy)

`contentSecurityPolicy` allows you to configure the [`Content-Security-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) header for images. This is particularly important when using [`dangerouslyAllowSVG`](#dangerouslyallowsvg) to prevent scripts embedded in the image from executing.

By default, the [loader](#loader) sets the [`Content-Disposition`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition#as_a_response_header_for_the_main_body) header to `attachment` for added protection since the API can serve arbitrary remote images.

The default value is `attachment` which forces the browser to download the image when visiting directly. This is particularly important when [`dangerouslyAllowSVG`](#dangerouslyallowsvg) is true.

You can optionally configure `inline` to allow the browser to render the image when visiting directly, without downloading it.

### Deprecated configuration options[](#deprecated-configuration-options)

#### `domains`[](#domains)

> **Warning**: Deprecated since Next.js 14 in favor of strict [`remotePatterns`](#remotepatterns) in order to protect your application from malicious users.

Similar to [`remotePatterns`](#remotepatterns), the `domains` configuration can be used to provide a list of allowed hostnames for external images. However, the `domains` configuration does not support wildcard pattern matching and it cannot restrict protocol, port, or pathname.

Since most remote image servers are shared between multiple tenants, it's safer to use `remotePatterns` to ensure only the intended images are optimized.

Below is an example of the `domains` property in the `next.config.js` file:

## Functions[](#functions)

### `getImageProps`[](#getimageprops)

The `getImageProps` function can be used to get the props that would be passed to the underlying `<img>` element, and instead pass them to another component, style, canvas, etc.

This also avoid calling React `useState()` so it can lead to better performance, but it cannot be used with the [`placeholder`](#placeholder) prop because the placeholder will never be removed.

## Known browser bugs[](#known-browser-bugs)

This `next/image` component uses browser native [lazy loading](https://caniuse.com/loading-lazy-attr), which may fallback to eager loading for older browsers before Safari 15.4. When using the blur-up placeholder, older browsers before Safari 12 will fallback to empty placeholder. When using styles with `width`/`height` of `auto`, it is possible to cause [Layout Shift](https://web.dev/cls/) on older browsers before Safari 15 that don't [preserve the aspect ratio](https://caniuse.com/mdn-html_elements_img_aspect_ratio_computed_from_attributes). For more details, see [this MDN video](https://www.youtube.com/watch?v=4-d_SoCHeWE).

-   [Safari 15 - 16.3](https://bugs.webkit.org/show_bug.cgi?id=243601) display a gray border while loading. Safari 16.4 [fixed this issue](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/#:~:text=Now%20in%20Safari%2016.4%2C%20a%20gray%20line%20no%20longer%20appears%20to%20mark%20the%20space%20where%20a%20lazy%2Dloaded%20image%20will%20appear%20once%20it%E2%80%99s%20been%20loaded.). Possible solutions:
    -   Use CSS `@supports (font: -apple-system-body) and (-webkit-appearance: none) { img[loading="lazy"] { clip-path: inset(0.6px) } }`
    -   Use [`loading="eager"`](#loading) if the image is above the fold
-   [Firefox 67+](https://bugzilla.mozilla.org/show_bug.cgi?id=1556156) displays a white background while loading. Possible solutions:
    -   Enable [AVIF `formats`](#formats)
    -   Use [`placeholder`](#placeholder)

## Examples[](#examples)

### Styling images[](#styling-images)

Styling the Image component is similar to styling a normal `<img>` element, but there are a few guidelines to keep in mind:

Use `className` or `style`, not `styled-jsx`. In most cases, we recommend using the `className` prop. This can be an imported [CSS Module](https://nextjs.org/docs/app/getting-started/css), a [global stylesheet](https://nextjs.org/docs/app/getting-started/css#global-css), etc.

You can also use the `style` prop to assign inline styles.

When using `fill`, the parent element must have `position: relative` or `display: block`. This is necessary for the proper rendering of the image element in that layout mode.

You cannot use [styled-jsx](https://nextjs.org/docs/app/guides/css-in-js) because it's scoped to the current component (unless you mark the style as `global`).

### Responsive images with a static export[](#responsive-images-with-a-static-export)

When you import a static image, Next.js automatically sets its width and height based on the file. You can make the image responsive by setting the style:

![Responsive image filling the width and height of its parent container](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371082/aha-mind/docs-crawler/nextjs.org/image_u3l4v2.png)![Responsive image filling the width and height of its parent container](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371082/aha-mind/docs-crawler/nextjs.org/image_ohxntn.png)

### Responsive images with a remote URL[](#responsive-images-with-a-remote-url)

If the source image is a dynamic or a remote URL, you must provide the width and height props so Next.js can calculate the aspect ratio:

Try it out:

-   [Demo the image responsive to viewport](https://image-component.nextjs.gallery/responsive)

### Responsive image with `fill`[](#responsive-image-with-fill)

If you don't know the aspect ratio of the image, you can add the [`fill` prop](#fill) with the `objectFit` prop set to `cover`. This will make the image fill the full width of its parent container.

![Grid of images filling parent container width](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371082/aha-mind/docs-crawler/nextjs.org/image_ixk4zs.png)![Grid of images filling parent container width](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371082/aha-mind/docs-crawler/nextjs.org/image_fkit5c.png)

### Background Image[](#background-image)

Use the `fill` prop to make the image cover the entire screen area:

![Background image taking full width and height of page](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371082/aha-mind/docs-crawler/nextjs.org/image_tnynei.png)![Background image taking full width and height of page](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371082/aha-mind/docs-crawler/nextjs.org/image_xmivfe.png)

For examples of the Image component used with the various styles, see the [Image Component Demo](https://image-component.nextjs.gallery/).

### Remote images[](#remote-images)

To use a remote image, the `src` property should be a URL string.

Since Next.js does not have access to remote files during the build process, you'll need to provide the [`width`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height), [`height`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height) and optional [`blurDataURL`](https://nextjs.org/docs/app/api-reference/components/image#blurdataurl) props manually.

The `width` and `height` attributes are used to infer the correct aspect ratio of image and avoid layout shift from the image loading in. The `width` and `height` do _not_ determine the rendered size of the image file.

To safely allow optimizing images, define a list of supported URL patterns in `next.config.js`. Be as specific as possible to prevent malicious usage. For example, the following configuration will only allow images from a specific AWS S3 bucket:

### Theme detection[](#theme-detection)

If you want to display a different image for light and dark mode, you can create a new component that wraps two `<Image>` components and reveals the correct one based on a CSS media query.

> **Good to know**: The default behavior of `loading="lazy"` ensures that only the correct image is loaded. You cannot use `preload` or `loading="eager"` because that would cause both images to load. Instead, you can use [`fetchPriority="high"`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/fetchPriority).

Try it out:

-   [Demo light/dark mode theme detection](https://image-component.nextjs.gallery/theme)

### Art direction[](#art-direction)

If you want to display a different image for mobile and desktop, sometimes called [Art Direction](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#art_direction), you can provide different `src`, `width`, `height`, and `quality` props to `getImageProps()`.

### Background CSS[](#background-css)

You can even convert the `srcSet` string to the [`image-set()`](https://developer.mozilla.org/en-US/docs/Web/CSS/image/image-set) CSS function to optimize a background image.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.1.7` | `maximumDiskCacheSize` configuration added. |
| `v16.1.2` | `maximumResponseBody` configuration added. |
| `v16.0.0` | `qualities` default configuration changed to `[75]`, `preload` prop added, `priority` prop deprecated, `dangerouslyAllowLocalIP` config added, `maximumRedirects` config added. |
| `v15.3.0` | `remotePatterns` added support for array of `URL` objects. |
| `v15.0.0` | `contentDispositionType` configuration default changed to `attachment`. |
| `v14.2.23` | `qualities` configuration added. |
| `v14.2.15` | `decoding` prop added and `localPatterns` configuration added. |
| `v14.2.14` | `remotePatterns.search` prop added. |
| `v14.2.0` | `overrideSrc` prop added. |
| `v14.1.0` | `getImageProps()` is stable. |
| `v14.0.0` | `onLoadingComplete` prop and `domains` config deprecated. |
| `v13.4.14` | `placeholder` prop support for `data:/image...` |
| `v13.2.0` | `contentDispositionType` configuration added. |
| `v13.0.6` | `ref` prop added. |
| `v13.0.0` | The `next/image` import was renamed to `next/legacy/image`. The `next/future/image` import was renamed to `next/image`. A [codemod is available](https://nextjs.org/docs/app/guides/upgrading/codemods#next-image-to-legacy-image) to safely and automatically rename your imports. `<span>` wrapper removed. `layout`, `objectFit`, `objectPosition`, `lazyBoundary`, `lazyRoot` props removed. `alt` is required. `onLoadingComplete` receives reference to `img` element. Built-in loader config removed. |
| `v12.3.0` | `remotePatterns` and `unoptimized` configuration is stable. |
| `v12.2.0` | Experimental `remotePatterns` and experimental `unoptimized` configuration added. `layout="raw"` removed. |
| `v12.1.1` | `style` prop added. Experimental support for `layout="raw"` added. |
| `v12.1.0` | `dangerouslyAllowSVG` and `contentSecurityPolicy` configuration added. |
| `v12.0.9` | `lazyRoot` prop added. |
| `v12.0.0` | `formats` configuration added.  
AVIF support added.  
Wrapper `<div>` changed to `<span>`. |
| `v11.1.0` | `onLoadingComplete` and `lazyBoundary` props added. |
| `v11.0.0` | `src` prop support for static import.  
`placeholder` prop added.  
`blurDataURL` prop added. |
| `v10.0.5` | `loader` prop added. |
| `v10.0.1` | `layout` prop added. |
| `v10.0.0` | `next/image` introduced. |
