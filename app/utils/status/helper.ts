import type { MonitorsResult, SiteStatus } from "~/types/status"

/**
 * 在新标签页打开链接
 */
export function jumpLink(url: string) {
	window.open(url, "_blank")
}

/**
 * 休眠指定毫秒
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 手动刷新最小间隔（毫秒）
 * UptimeRobot 免费档有请求速率限制，这里只限制“人肉连点”，自动刷新不走这个闸门
 */
export const MANUAL_REFRESH_INTERVAL = 60_000

/**
 * 计算手动刷新还需等待多少毫秒，0 表示可以刷新
 */
export function manualRefreshDelay(
	now: number,
	lastAt: number,
	intervalMs: number = MANUAL_REFRESH_INTERVAL,
): number {
	if (!lastAt) return 0
	const elapsed = now - lastAt
	return elapsed >= intervalMs ? 0 : intervalMs - elapsed
}

export interface GetSiteDataOptions {
	/** 绕开服务端缓存强制回源，手动刷新时使用 */
	force?: boolean
}

/**
 * 从服务端获取站点监控数据
 */
export async function getSiteData(options: GetSiteDataOptions = {}): Promise<void> {
	const statusStore = useStatusStore()
	try {
		statusStore.siteStatus = "loading"
		statusStore.errorMessage = ""
		const result = await $fetch<MonitorsResult>("/api/status/getMonitors", {
			method: "POST",
			// 手动刷新带此标记，服务端跳过缓存，保证“更新于”时间戳确实前进
			headers: options.force ? { "x-status-force": "1" } : {},
		})
		if (result.code !== 200 || !result.data) {
			throw new Error(result.message || "获取站点数据失败")
		}
		const { status } = result.data
		const nextStatus: SiteStatus =
			status.count === status.ok
				? "normal"
				: status.count === status.error
					? "error"
					: "warn"
		statusStore.$patch({
			siteData: result.data,
			siteStatus: nextStatus,
		})
	} catch (error) {
		const msg = error instanceof Error ? error.message : "未知错误"
		console.error("获取站点数据失败:", error)
		statusStore.errorMessage = msg
		statusStore.siteStatus = "unknown"
	}
}
