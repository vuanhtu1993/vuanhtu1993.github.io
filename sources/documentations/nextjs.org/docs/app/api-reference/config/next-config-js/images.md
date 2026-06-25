---
title: "next.config.js: images"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/images"
crawled_at: "2026-06-25T07:14:52.721Z"
---

Last updated

June 16, 2025

If you want to use a cloud provider to optimize images instead of using the Next.js built-in Image Optimization API, you can configure `next.config.js` with the following:

This `loaderFile` must point to a file relative to the root of your Next.js application. The file must export a default function that returns a string, for example:

Alternatively, you can use the [`loader` prop](https://nextjs.org/docs/app/api-reference/components/image#loader) to pass the function to each instance of `next/image`.

> **Good to know**: Customizing the image loader file, which accepts a function, requires using [Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) to serialize the provided function.

To learn more about configuring the behavior of the built-in [Image Optimization API](https://nextjs.org/docs/app/api-reference/components/image) and the [Image Component](https://nextjs.org/docs/app/api-reference/components/image), see [Image Configuration Options](https://nextjs.org/docs/app/api-reference/components/image#configuration-options) for available options.

## Example Loader Configuration[](#example-loader-configuration)

-   [Akamai](#akamai)
-   [AWS CloudFront](#aws-cloudfront)
-   [Cloudinary](#cloudinary)
-   [Cloudflare](#cloudflare)
-   [Contentful](#contentful)
-   [Fastly](#fastly)
-   [Gumlet](#gumlet)
-   [ImageEngine](#imageengine)
-   [Imgix](#imgix)
-   [PixelBin](#pixelbin)
-   [Sanity](#sanity)
-   [Sirv](#sirv)
-   [Supabase](#supabase)
-   [Thumbor](#thumbor)
-   [Imagekit](#imagekitio)
-   [Nitrogen AIO](#nitrogen-aio)

### Akamai[](#akamai)

### AWS CloudFront[](#aws-cloudfront)

### Cloudinary[](#cloudinary)

### Cloudflare[](#cloudflare)

### Contentful[](#contentful)

### Fastly[](#fastly)

### Gumlet[](#gumlet)

### ImageEngine[](#imageengine)

### Imgix[](#imgix)

### PixelBin[](#pixelbin)

### Sanity[](#sanity)

### Sirv[](#sirv)

### Supabase[](#supabase)

### Thumbor[](#thumbor)

### ImageKit.io[](#imagekitio)

### Nitrogen AIO[](#nitrogen-aio)
