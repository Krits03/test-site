import { defineStore } from "pinia"
import type { MonitorsDataResult, SiteStatus } from "~/types/status"

export const useStatusStore = defineStore("status", () => {
	// 站点整体状态
	const siteStatus = ref<SiteStatus>("loading")
	// 站点数据
	const siteData = ref<MonitorsDataResult>()
	// 错误信息
	const errorMessage = ref<string>("")
	// 滚动高度
	const scrollTop = ref(0)
	// 上一次手动刷新的时刻（毫秒），StatusHeader 与 StatusCards 共用同一冷却窗口
	const lastManualAt = ref(0)

	return { siteStatus, siteData, errorMessage, scrollTop, lastManualAt }
})
