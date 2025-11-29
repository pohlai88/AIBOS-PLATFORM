export function freezeObject<T extends object>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

