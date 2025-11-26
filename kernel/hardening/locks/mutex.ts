/**
 * Simple async mutex for critical kernel sections.
 * Ensures one operation at a time.
 */

export class Mutex {
  private mutex = Promise.resolve();

  lock<T>(fn: () => Promise<T>): Promise<T> {
    const previous = this.mutex;

    let release: () => void;
    this.mutex = new Promise(resolve => (release = resolve));

    return previous.then(async () => {
      try {
        return await fn();
      } finally {
        release!();
      }
    });
  }
}

