import type { MonitorsDataResult, MonitorsResult } from "~/types/status"
import { getCache, setCache } from "~/server/utils/status-cache"
import { formatSiteData } from "~/utils/status/format"

/**
 * 生成最近 N 天的日期范围
 */
function getRanges() {
	try {
		const config = useRuntimeConfig()
		const days = Number(config.public.statusCountDays ?? 60)
		const today = Temporal.Now.plainDate("Asia/Shanghai")
		const dates: Temporal.PlainDate[] = []

		for (let d = 0; d < days; d++) {
			dates.push(today.subtract({ days: d }))
		}

		const ranges = dates.map((date) => {
			const start = date.toZonedDateTime("Asia/Shanghai").epochSeconds
			const end = date.add({ days: 1 }).toZonedDateTime("Asia/Shanghai")
				.epochSeconds
			return `${start}_${end}`
		})

		const start = dates[dates.length - 1].toZonedDateTime("Asia/Shanghai")
			.epochSeconds
		const end = dates[0].add({ days: 1 }).toZonedDateTime("Asia/Shanghai")
			.epochSeconds
		ranges.push(`${start}_${end}`)

		return { dates, start, end, ranges: ranges.join("-") }
	} catch (error) {
		console.error("生成日期范围失败:", error)
		return undefined
	}
}

/**
 * 获取 UptimeRobot 站点监控数据
 */
export default defineEventHandler(async (event): Promise<MonitorsResult> => {
	try {
		const config = useRuntimeConfig()
		const apiUrl = config.statusApiUrl || "https://api.uptimerobot.com/v2/"
		const apiKey = config.statusApiKey

		if (!apiKey) {
			throw new Error("未配置 UptimeRobot API Key（STATUS_API_KEY）")
		}

		// 检查缓存
		const cacheKey = "site-status-data"
		const cachedData = getCache<MonitorsDataResult>(cacheKey)
		if (cachedData) {
			return {
				code: 200,
				message: "success",
				source: "cache",
				data: cachedData,
			}
		}

		const rangesData = getRanges()
		if (!rangesData) throw new Error("日期范围生成失败")

		const { dates, ranges, start, end } = rangesData

		// 构造 UptimeRobot API 请求体
		const body = {
			api_key: apiKey,
			format: "json",
			logs: 1,
			log_types: "1-2",
			logs_start_date: start,
			logs_end_date: end,
			custom_uptime_ranges: ranges,
		}

		// 调用 UptimeRobot API
		const result = await $fetch(apiUrl + "getMonitors", {
			method: "POST",
			body,
		})

		// 格式化数据
		const data = formatSiteData(result, dates)
		if (!data) throw new Error("站点数据为空")

		// 缓存 1 分钟
		setCache(cacheKey, data, 60 * 1000)

		return {
			code: 200,
			message: "success",
			source: "api",
			data,
		}
	} catch (error) {
		console.error("获取监控数据失败:", error)
		setResponseStatus(event, 500)
		return {
			code: 500,
			message: error instanceof Error ? error.message : "未知错误",
			source: "api",
			data: undefined,
		}
	}
})
