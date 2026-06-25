---
title: "Functions: refresh"
source_url: "https://nextjs.org/docs/app/api-reference/functions/refresh"
crawled_at: "2026-06-25T07:10:23.972Z"
---

Last updated

March 3, 2026

`refresh` allows you to refresh the client router from within a [Server Action](https://nextjs.org/docs/app/getting-started/mutating-data).

## Usage[](#usage)

`refresh` can **only** be called from within Server Actions. It cannot be used in Route Handlers, Client Components, or any other context.

## Parameters[](#parameters)

```
refresh(): void;
```

## Returns[](#returns)

`refresh` does not return a value.

## Examples[](#examples)

app/actions.ts

```
'use server'
 
import { refresh } from 'next/cache'
 
export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')
 
  // Create the post in your database
  const post = await db.post.create({
    data: { title, content },
  })
 
  refresh()
}
```

### Error when used outside Server Actions[](#error-when-used-outside-server-actions)

app/api/posts/route.ts

```
import { refresh } from 'next/cache'
 
export async function POST() {
  // This will throw an error
  refresh()
}
```
