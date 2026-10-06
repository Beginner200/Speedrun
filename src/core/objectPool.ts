export class ObjectPool<T> {
  private readonly available: T[] = [];
  private readonly factory: () => T;

  constructor(factory: () => T, initialSize = 0) {
    this.factory = factory;
    for (let i = 0; i < initialSize; i++) this.available.push(factory());
  }

  acquire(): T {
    return this.available.pop() ?? this.factory();
  }

  release(item: T): void {
    this.available.push(item);
  }

  get size(): number {
    return this.available.length;
  }

  clear(): void {
    this.available.length = 0;
  }
}
