import { describe, expect, it } from 'vitest';
import { ObjectPool } from './objectPool';

describe('ObjectPool', () => {
  it('reuses released objects before creating new ones', () => {
    let created = 0;
    const pool = new ObjectPool(() => ({ id: ++created }), 1);
    const first = pool.acquire();
    const second = pool.acquire();
    expect(created).toBe(2);

    pool.release(first);
    const reused = pool.acquire();
    expect(reused).toBe(first);
    expect(created).toBe(2);
    expect(second).not.toBe(reused);
  });

  it('preallocates and reports available capacity', () => {
    const pool = new ObjectPool(() => ({}), 4);
    expect(pool.size).toBe(4);
    pool.acquire();
    expect(pool.size).toBe(3);
    pool.clear();
    expect(pool.size).toBe(0);
  });
});
