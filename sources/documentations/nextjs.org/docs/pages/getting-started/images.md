---
title: "Getting Started: Images"
source_url: "https://nextjs.org/docs/pages/getting-started/images"
crawled_at: "2026-06-25T07:21:13.627Z"
---

## Image Optimization

Last updated

May 8, 2025

The Next.js [`<Image>`](https://nextjs.org/docs/app/api-reference/components/image) component extends the HTML `<img>` element to provide:

-   **Size optimization:** Automatically serving correctly sized images for each device, using modern image formats like WebP.
-   **Visual stability:** Preventing [layout shift](https://web.dev/articles/cls) automatically when images are loading.
-   **Faster page loads:** Only loading images when they enter the viewport using native browser lazy loading, with optional blur-up placeholders.
-   **Asset flexibility:** Resizing images on-demand, even images stored on remote servers.

To start using `<Image>`, import it from `next/image` and render it within your component.

The `src` property can be a [local](#local-images) or [remote](#remote-images) image.

> **🎥 Watch:** Learn more about how to use `next/image` → [YouTube (9 minutes)](https://youtu.be/IU_qq_c_lKA).

## Local images[](#local-images)

You can store static files, like images and fonts, under a folder called [`public`](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) in the root directory. Files inside `public` can then be referenced by your code starting from the base URL (`/`).

![Folder structure showing app and public folders](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372078/aha-mind/docs-crawler/nextjs.org/image_g4cnml.png)![Folder structure showing app and public folders](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372078/aha-mind/docs-crawler/nextjs.org/image_nr4ssk.png)

If the image is statically imported, Next.js will automatically determine the intrinsic [`width`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height) and [`height`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height). These values are used to determine the image ratio and prevent [Cumulative Layout Shift](https://web.dev/articles/cls) while your image is loading.

### Images without static imports[](#images-without-static-imports)

If you can't use a static `import` for your images, you can use a dynamic `import()` in a Server Component to still get automatic `width`, `height`, and `blurDataURL`:

If you have a [path alias](https://www.typescriptlang.org/tsconfig/#paths) configured (e.g. `@/`), you can use it instead of a relative path:

The path must include a static prefix (like `../content/blog/images/`). Be as specific as possible, since **all** files matching that prefix are bundled. Only files in your specified directory are included, so external input cannot reach outside of it.

## Remote images[](#remote-images)

To use a remote image, you can provide a URL string for the `src` property.

Since Next.js does not have access to remote files during the build process, you'll need to provide the [`width`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height), [`height`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height) and optional [`blurDataURL`](https://nextjs.org/docs/app/api-reference/components/image#blurdataurl) props manually. The `width` and `height` are used to infer the correct aspect ratio of image and avoid layout shift from the image loading in. Alternatively, you can use the [`fill` property](https://nextjs.org/docs/app/api-reference/components/image#fill) to make the image fill the size of the parent element.

To safely allow images from remote servers, you need to define a list of supported URL patterns in [`next.config.js`](https://nextjs.org/docs/app/api-reference/config/next-config-js). Be as specific as possible to prevent malicious usage. For example, the following configuration will only allow images from a specific AWS S3 bucket:
