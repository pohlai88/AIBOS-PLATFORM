/**
 * safeAwait - an enterprise-grade async wrapper
 *
 * Returns: [error, result]
 *
 * This prevents:
 * - unhandled promise rejections
 * - boot sequence freeze
 * - async waterfalls
 * - unpredictable crashes
 */

export async function safeAwait<T>(
  promise: Promise<T>
): Promise<[unknown, T | undefined]> {
  try {
    const result = await promise;
    return [undefined, result];
  } catch (error) {
    return [error, undefined];
  }
}

