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
 * 从服务端获取站点监控数据
 */
export async function getSiteData(): Promise<void> {
	const statusStore = useStatusStore()
	try {
		statusStore.siteStatus = "loading"
		const result = await $fetch<MonitorsResult>("/api/status/getMonitors", {
			method: "POST",
		})
		if (result.code !== 200 || !result.data) {
			throw new Error("获取站点数据失败")
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
		console.error("获取站点数据失败:", error)
		statusStore.siteStatus = "unknown"
	}
}
