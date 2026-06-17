---
title: "Store integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/stores"
crawled_at: "2026-06-17T14:49:23.402Z"
---

## Overview

LangChain provides a key-value store interface for storing and retrieving data by key. The key-value store interface in LangChain is primarily used for caching [embeddings](https://docs.langchain.com/oss/javascript/integrations/embeddings).

## Interface

All [`BaseStores`](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) are **generic** and support the following interface, where `K` represents the key type and `V` represents the value type:

-   `mget(keys: K[]): Promise<(V | undefined)[]>`: get the values for multiple keys, returning `undefined` if a key does not exist
-   `mset(keyValuePairs: [K, V][]): Promise<void>`: set the values for multiple keys
-   `mdelete(keys: K[]): Promise<void>`: delete multiple keys
-   `yieldKeys(prefix?: string): AsyncGenerator<K | string>`: asynchronously yield all keys in the store, optionally filtering by a prefix

The generic nature of the interface allows you to use different types for keys and values. For example, `BaseStore<string, BaseMessage>` would store messages with string keys, while `BaseStore<string, number[]>` would store arrays of numbers.

## Built-in stores for local development

## Custom stores

You can also implement your own custom store by extending the [`BaseStore`](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) class. See the [store interface documentation](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) for more details.

---
