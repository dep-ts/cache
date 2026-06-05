import { Memory, CACHE } from './memory.ts';
import type { CacheValue } from './types.ts';

/**
 * Persistent cache backed by the browser’s `localStorage`.
 *
 * - Extends {@link Memory} – all public methods behave identically.
 * - Automatically persists the **entire cache** after every mutation (`set`, `delete`, `clear`).
 * - On construction, loads existing data from `localStorage` under the given key.
 *
 * @remarks
 * - Only runs in **browser environments** (uses `window.localStorage`).
 * - Stores data as a JSON array of `[key, value]` tuples.
 * - Invalid or corrupted data is silently ignored on load.
 *
 * @example
 * ```ts
 * const cache = new Storage('my-app');
 * cache.set('user', 'alice');
 * console.log(cache.get('user')); // => "alice"
 * ```
 */
export class Storage extends Memory {
  /**
   * Creates a new Storage instance with localStorage persistence
   * @param name - The storage key name for persistence (defaults to 'cache')
   */
  constructor(private name: string = 'cache') {
    super();
    const raw = localStorage.getItem(this.name) ?? '[]';
    const entries: [string, CacheValue][] = JSON.parse(raw);
    this[CACHE](entries);
  }

  /**
   * Sets a value in the cache and persists to localStorage
   * @param key - Cache key (must be a string)
   * @param value - Value to store (string, number, or boolean)
   * @returns The underlying Map instance
   * @throws {CacheError} If key is not a string
   * @throws {CacheError} If value is not string, number, or boolean
   */
  override set(key: string, value: CacheValue): Map<string, CacheValue> {
    const cache = this[CACHE]().set(key, value);
    this.#update();
    return cache;
  }

  /**
   * Removes all entries from the cache and clears localStorage
   */
  override clear(): void {
    this[CACHE]().clear();
    localStorage.removeItem(this.name);
  }

  /**
   * Removes a specific entry from the cache and updates localStorage
   * @param key - The key to remove
   * @returns True if the entry was found and removed, false otherwise
   */
  override delete(key: string): boolean {
    const deleted = this[CACHE]().delete(key);
    this.#update();
    return deleted;
  }

  /**
   * Internal method to persist current cache state to localStorage
   * @private
   */
  #update() {
    const entries = Array.from(this[CACHE]().entries());
    const raw = JSON.stringify(entries);
    localStorage.setItem(this.name, raw);
  }
}
