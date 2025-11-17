import { Memory } from './memory.ts';
import type { CacheValue } from './types.ts';
import { write, read } from '@dep/text';

/**
 * Persistent file-backed cache that mirrors an in-memory {@link Memory} store.
 *
 * - Reads/writes JSON to `path` on every mutation (`set`, `delete`, `clear`).
 * - Loads existing file on first operation (lazy init).
 * - All public methods are **asynchronous** and return the same shape as `Memory`
 *   for drop-in compatibility.
 *
 * @example
 * ```ts
 * const cache = new Disk('data/my-cache.json');
 * await cache.set('theme', 'dark');
 * console.log(await cache.get('theme')); // => "dark"
 * ```
 */
export class Disk {
  #cache = new Memory();
  readonly #initialized: Promise<void>;

  /**
   * Creates a new file-based cache instance.
   *
   * @param path - Configuration path for the cache file
   */
  constructor(private path: string = 'cache/cache.json') {
    this.#initialized = this.#init();
  }

  /**
   * Sets a value in the cache and persists to file.
   *
   * @param key - Cache key (must be a string)
   * @param value - Value to store (string, number, or boolean)
   * @returns Promise that resolves with the cache instance for chaining
   * @throws {CacheError} If cache initialization fails
   * @throws {CacheError} If file write operation fails
   * @throws {CacheError} If key is not a string or value is invalid type
   */
  async set(key: string, value: CacheValue): Promise<Map<string, CacheValue>> {
    await this.#ensureInitialized();
    const cache = this.#cache.set(key, value);
    await this.#save();
    return cache;
  }

  /**
   * Deletes a key from the cache and persists the change to file.
   *
   * @param key - The key to delete
   * @returns Promise that resolves with true if the key was found and deleted, false otherwise
   * @throws {CacheError} If cache initialization fails
   * @throws {CacheError} If file write operation fails
   */
  async delete(key: string): Promise<boolean> {
    await this.#ensureInitialized();
    const deleted = this.#cache.delete(key);
    await this.#save();
    return deleted;
  }

  /**
   * Clears all entries from the cache and persists the change to file.
   *
   * @returns Promise that resolves when the cache is cleared
   * @throws {CacheError} If file write operation fails
   */
  async clear(): Promise<void> {
    this.#cache.clear();
    await this.#save();
    await Deno.remove(this.path);
  }

  /**
   * Gets a value from the cache.
   *
   * @param key - The key to look up
   * @returns Promise that resolves with the value if found, undefined otherwise
   * @throws {CacheError} If cache initialization fails
   */
  async get(key: string): Promise<CacheValue | undefined> {
    await this.#ensureInitialized();
    return this.#cache.get(key);
  }

  /**
   * Checks if a key exists in the cache.
   *
   * @param key - The key to check
   * @returns Promise that resolves with true if the key exists, false otherwise
   * @throws {CacheError} If cache initialization fails
   */
  async has(key: string): Promise<boolean> {
    await this.#ensureInitialized();
    return this.#cache.has(key);
  }

  /**
   * Returns the number of entries in the cache.
   *
   * @returns Promise that resolves with the number of entries
   * @throws {CacheError} If cache initialization fails
   */
  async size(): Promise<number> {
    await this.#ensureInitialized();
    return this.#cache.size();
  }

  /**
   * Returns an array of all keys in the cache.
   *
   * @returns Promise that resolves with an array of keys
   * @throws {CacheError} If cache initialization fails
   */
  async keys(): Promise<string[]> {
    await this.#ensureInitialized();
    return Array.from(this.#cache.keys());
  }

  /**
   * Returns an array of all values in the cache.
   *
   * @returns Promise that resolves with an array of values
   * @throws {CacheError} If cache initialization fails
   */
  async values(): Promise<CacheValue[]> {
    await this.#ensureInitialized();
    return Array.from(this.#cache.values());
  }

  /**
   * Returns an array of [key, value] pairs in the cache.
   *
   * @returns Promise that resolves with an array of entries
   * @throws {CacheError} If cache initialization fails
   */
  async entries(): Promise<[string, CacheValue][]> {
    await this.#ensureInitialized();
    return Array.from(this.#cache.entries());
  }

  /**
   * Executes a callback for each entry in the cache.
   *
   * @param callback - The function to call for each entry, receiving value and key
   * @returns Promise that resolves when the iteration is complete
   * @throws {CacheError} If cache initialization fails
   */
  async forEach(
    callback: (value: CacheValue, key: string) => void
  ): Promise<void> {
    await this.#ensureInitialized();
    this.#cache.forEach(callback);
  }

  async #save() {
    const obj = Object.fromEntries(this.#cache.entries());
    await write(this.path, JSON.stringify(obj, null, 2));
  }

  async #ensureInitialized(): Promise<void> {
    await this.#initialized;
  }

  async #init() {
    try {
      const content = await read(this.path);
      const parsed = JSON.parse(content);

      const newCache = new Memory();
      for (const [key, value] of Object.entries(parsed)) {
        if (this.#isValidCacheValue(value)) {
          newCache.set(key, value);
        }
      }
      this.#cache = newCache;
    } catch {
      this.#cache.clear();
    }
  }

  #isValidCacheValue(value: unknown): value is CacheValue {
    return ['string', 'number', 'boolean'].includes(typeof value);
  }
}
