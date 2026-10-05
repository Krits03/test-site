/**
 * 站点状态监测 - 客户端公共配置（可暴露给浏览器）
 *
 * 环境变量（构建时注入，Vite 约定以 VITE_ 或 NUXT_PUBLIC_ 开头）：
 *   STATUS_COUNT_DAYS        统计天数（默认 60，建议 30-90）
 *   STATUS_SHOW_LINK         是否在卡片上显示站点跳转链接（默认 true）
 *   STATUS_REFRESH_INTERVAL  前端自动刷新间隔（秒，默认 300 = 5分钟）
 */

export interface StatusPublicConfig {
	/** 可用性统计天数 */
	countDays: number
	/** 是否在状态卡片上显示站点跳转链接 */
	showLink: boolean
	/** 前端自动刷新间隔（秒） */
	refreshInterval: number
}

export const statusPublicConfig: StatusPublicConfig = {
	countDays: Number(import.meta.env.STATUS_COUNT_DAYS || 60),
	showLink: import.meta.env.STATUS_SHOW_LINK !== "false",
	refreshInterval: Number(import.meta.env.STATUS_REFRESH_INTERVAL || 300),
}
