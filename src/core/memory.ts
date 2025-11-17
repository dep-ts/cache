import { CacheError } from './error.ts';
import type { CacheValue } from './types.ts';
export const CACHE = Symbol('cache');

/**
 * In-memory cache for primitive values (`string | number | boolean`).
 *
 * - Lightweight wrapper around `Map<string, CacheValue>`.
 * - All operations are **synchronous** and type-safe.
 * - Designed as a drop-in base for persistent backends (`Disk`, `Storage`).
 *
 * @remarks
 * - Uses a **Symbol-keyed accessor** `[CACHE]` to allow subclasses to access
 *   the underlying `Map` without exposing it publicly.
 * - Throws {@link CacheError} on invalid key/value types.
 *
 * @example
 * ```ts
 * const cache = new Memory();
 * cache.set('count', 42);
 * console.log(cache.get('count')); // => 42
 * ```
 */
export class Memory {
  #cache = new Map<string, CacheValue>();

  /**
   * Internal cache accessor method. Provides direct access to the underlying Map
   * @param iterable - Optional initial data to populate the cache
   * @returns The underlying Map instance
   */
  [CACHE](
    iterable?: Iterable<readonly [string, CacheValue]>
  ): Map<string, CacheValue> {
    if (iterable) this.#cache = new Map<string, CacheValue>(iterable);
    return this.#cache;
  }

  /**
   * Sets a value in the cache
   * @param key - Cache key (must be a string)
   * @param value - Value to store (string, number, or boolean)
   * @returns The cache instance for chaining
   * @throws {CacheError} If key is not a string
   * @throws {CacheError} If value is not string, number, or boolean
   */
  set(key: string, value: CacheValue): Map<string, CacheValue> {
    if (typeof key !== 'string') {
      throw new CacheError('Cache key must be a string');
    }
    if (!['string', 'number', 'boolean'].includes(typeof value)) {
      throw new CacheError('Cache value must be string, number, or boolean');
    }
    return this.#cache.set(key, value);
  }

  /**
   * Retrieves a value from the cache by key
   * @param key - The cache key to retrieve
   * @returns The cached value or undefined if not found
   */
  get(key: string): CacheValue | undefined {
    return this.#cache.get(key);
  }

  /**
   * Checks if a key exists in the cache
   * @param key - The key to check
   * @returns True if the key exists in the cache
   */
  has(key: string): boolean {
    return this.#cache.has(key);
  }

  /**
   * Gets the number of entries in the cache
   * @returns The number of cached entries
   */
  size(): number {
    return this.#cache.size;
  }

  /**
   * Returns an iterator of all keys in the cache
   * @returns Iterator for all cache keys
   */
  keys(): MapIterator<string> {
    return this.#cache.keys();
  }

  /**
   * Returns an iterator of all values in the cache
   * @returns Iterator for all cache values
   */
  values(): MapIterator<CacheValue> {
    return this.#cache.values();
  }

  /**
   * Removes all entries from the cache
   */
  clear(): void {
    this.#cache.clear();
  }

  /**
   * Removes a specific entry from the cache
   * @param key - The key to remove
   * @returns True if the entry was found and removed, false otherwise
   */
  delete(key: string): boolean {
    const deleted = this.#cache.delete(key);
    return deleted;
  }

  /**
   * Returns an iterator of all key-value pairs in the cache
   * @returns Iterator for all cache entries as [key, value] pairs
   */
  entries(): MapIterator<[string, CacheValue]> {
    return this.#cache.entries();
  }

  /**
   * Executes a callback function for each key-value pair in the cache
   * @param callback - Function to execute for each entry
   * @param thisArg - Optional value to use as `this` when executing callback
   */
  forEach(
    callback: (
      value: CacheValue,
      key: string,
      map: Map<string, CacheValue>
    ) => void
  ): void {
    this.#cache.forEach(callback);
  }
}
