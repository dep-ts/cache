# @deb/cache 💾

> Tiny, type-safe cache with in-memory, file, and browser persistence backends.

## [![JSR version](https://jsr.io/badges/@deb/cache)](https://jsr.io/@deb/cache)

## Features ✨

- 🧠 **In-memory** (`Memory`) – fast, synchronous, lightweight
- 💽 **File-backed** (`Disk`) – persistent JSON cache with lazy loading
- 🌐 **Browser `localStorage`** (`Storage`) – automatic persistence in the browser
- ✅ **Type-safe** – only `string | number | boolean` values
- 🚨 **Consistent errors** – `Error` for all failures

---

## Installation 📦

- **Deno**:

  ```bash
  deno add jsr:@deb/cache
  ```

- **Node.js (18+) or Browsers**:

  ```bash
  npx jsr add @deb/cache
  ```

  Then import as an ES module:

  ```typescript
  import { Memory, Disk, Storage, Error, type Value } from '@deb/cache';
  ```

---

## Usage 🎯

### API 🧩

#### `Memory` – In-memory cache

```ts
import { Memory } from '@deb/cache';

const cache = new Memory();
cache.set('theme', 'dark');
cache.set('count', 42);
cache.set('active', true);

console.log(cache.get('theme')); // => "dark"
console.log(cache.size()); // => 3
```

#### `Disk` – File-based persistent cache

```ts
import { Disk } from '@deb/cache';
//NOTE: Disk is Deno only

const cache = new Disk('config/app.json');

await cache.set('user', 'alice');
console.log(await cache.get('user')); // => "alice"

// File `config/app.json` now contains:
// {
//   "user": "alice"
// }
```

#### `Storage` – Browser `localStorage` cache

```ts
import { Storage } from '@deb/cache';

const cache = new Storage('my-app');
cache.set('lang', 'es');
console.log(cache.get('lang')); // => "es"

// Persisted in localStorage under key "my-app"
```

#### Error handling

```ts
import { Error } from '@deb/cache';

try {
  cache.set(123, 'invalid'); // throws
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message); // "Cache key must be a string"
  }
}
```

#### Shared interface

All backends share the same API:

```ts
await cache.set('key', value);
await cache.get('key');
await cache.has('key');
await cache.delete('key');
await cache.clear();
await cache.size();
await cache.keys();
await cache.values();
await cache.entries();
await cache.forEach((value, key) => { ... });
```

---

## License 📄

MIT License – see [LICENSE](LICENSE) for details.

**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
