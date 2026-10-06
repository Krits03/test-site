import { Temporal } from "temporal-polyfill"
import type { MonitorsDataResult, MonitorsResult } from "~/types/status"
import { getCache, setCache } from "../../utils/status-cache"
import { statusServerConfig } from "../../utils/status.config"
import { createStatusPublicConfig } from "~/config/status.config"
import { formatSiteData } from "~/utils/status/format"

const statusPublicConfig = createStatusPublicConfig()

/**
 * 生成最近 N 天的日期范围
 */
function getRanges() {
	try {
		const days = statusPublicConfig.countDays
		// Temporal.Now.plainDate() 参数是日历，不是时区；需用 zonedDateTime 获取指定时区的日期
		const today = Temporal.Now.zonedDateTime("Asia/Shanghai").plainDate
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
		const { apiKey, apiUrl, cacheTTL } = statusServerConfig

		if (!apiKey) {
			throw new Error("未配置 UptimeRobot API Key，请设置环境变量 API_KEY")
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

		// 检查 UptimeRobot API 响应状态
		if (result?.stat === "fail") {
			const errorMsg = result?.error?.message || "UptimeRobot API 返回失败"
			console.error("UptimeRobot API 错误:", JSON.stringify(result?.error))
			throw new Error(`UptimeRobot API 错误: ${errorMsg}`)
		}

		// 格式化数据
		const data = formatSiteData(result, dates, statusPublicConfig.showLink)
		if (!data) throw new Error("站点数据为空，请检查 API Key 是否有监控站点")

		// 缓存
		setCache(cacheKey, data, cacheTTL)

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
