/**
 * 服务端内存缓存（简单 TTL 实现，替代 lru-cache）
 */
interface CacheEntry<T> {
	value: T
	expireAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export function getCache<T>(key: string): T | undefined {
	const entry = cache.get(key)
	if (!entry) return undefined
	if (Date.now() > entry.expireAt) {
		cache.delete(key)
		return undefined
	}
	return entry.value as T
}

export function setCache(key: string, value: unknown, ttl?: number): void {
	cache.set(key, {
		value,
		expireAt: Date.now() + (ttl ?? 5 * 60 * 1000),
	})
}
