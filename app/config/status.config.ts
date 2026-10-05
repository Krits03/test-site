/**
 * 站点状态监测 - 客户端公共配置
 *
 * 环境变量（与原作者 imsyy/site-status 命名一致，构建时注入）：
 *   COUNT_DAYS              统计天数（默认 60，建议 30-90）
 *   SHOW_LINK               是否在卡片上显示站点跳转链接（默认 true）
 *   STATUS_REFRESH_INTERVAL 前端自动刷新间隔（秒，默认 300，本项目特有）
 *
 * 使用方式：
 *   - nuxt.config.ts 中调用 createStatusPublicConfig() 注入 runtimeConfig.public.status
 *   - 服务端代码可直接调用 createStatusPublicConfig()
 *   - 客户端组件使用 useStatusPublicConfig()
 */

export interface StatusPublicConfig {
	/** 可用性统计天数 */
	countDays: number
	/** 是否在状态卡片上显示站点跳转链接 */
	showLink: boolean
	/** 前端自动刷新间隔（秒） */
	refreshInterval: number
}

/**
 * 创建公共配置（Node 环境调用，构建时注入环境变量）
 */
export function createStatusPublicConfig(): StatusPublicConfig {
	return {
		countDays: Number(process.env.COUNT_DAYS || 60),
		showLink: process.env.SHOW_LINK !== "false",
		refreshInterval: Number(process.env.STATUS_REFRESH_INTERVAL || 300),
	}
}

/**
 * 客户端组合式函数：从 runtimeConfig 获取状态页公共配置
 */
export function useStatusPublicConfig(): StatusPublicConfig {
	const config = useRuntimeConfig()
	return config.public.status as StatusPublicConfig
}
