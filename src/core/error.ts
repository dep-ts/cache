/**
 * Custom error type used throughout the cache system.
 *
 * Thrown when:
 * - Invalid key/value types are provided.
 * - File I/O operations fail (`Disk`).
 * - `localStorage` is inaccessible or corrupted (`Storage`).
 * - Cache initialization fails.
 *
 * @remarks
 * - Extends the native `Error` class.
 * - Always has `name = 'CacheError'` for reliable `instanceof` checks.
 * - Use `message` to provide context (e.g., file path, key name).
 *
 * @example
 * ```ts
 * try {
 *   cache.set(123, 'value'); // wrong key type
 * } catch (err) {
 *   if (err instanceof CacheError) {
 *     console.error(err.message); // "Cache key must be a string"
 *   }
 * }
 * ```
 */
export class CacheError extends Error {
  /**
   * Creates a new CacheError instance.
   * @param message - The error message describing the issue.
   */
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}
