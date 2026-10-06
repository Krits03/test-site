/**
 * 站点状态监测 - 服务端配置（含敏感信息，不会打包到客户端）
 *
 * 环境变量（与原作者 imsyy/site-status 命名一致）：
 *   API_KEY        UptimeRobot Read-only API Key（必填）
 *   API_URL        UptimeRobot API 地址（可选，默认官方地址）
 *   STATUS_CACHE_TTL  服务端缓存有效期（毫秒，可选，默认 60000，本项目特有）
 */

export interface StatusServerConfig {
	/** UptimeRobot Read-only API Key */
	apiKey: string
	/** UptimeRobot API 基础地址 */
	apiUrl: string
	/** 服务端内存缓存有效期（毫秒） */
	cacheTTL: number
}

export const statusServerConfig: StatusServerConfig = {
	// 向后兼容：优先 API_KEY（原作者命名），其次 STATUS_API_KEY（旧命名）
	apiKey: process.env.API_KEY || process.env.STATUS_API_KEY || "",
	apiUrl: process.env.API_URL || process.env.STATUS_API_URL || "https://api.uptimerobot.com/v2/",
	cacheTTL: Number(process.env.STATUS_CACHE_TTL || 60 * 1000),
}
