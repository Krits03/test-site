import type {
	MonitorsDataResult,
	SiteDaysStatus,
	SiteStatusType,
} from "~/types/status"

/**
 * 格式化 UptimeRobot 返回的站点数据
 */
export function formatSiteData(
	data: any,
	dates: Temporal.PlainDate[],
): MonitorsDataResult | undefined {
	if (!data?.monitors) return undefined

	const config = useRuntimeConfig()
	const showLink = config.public.statusShowLink ?? true
	const sites: any[] = data.monitors

	const formatData: SiteStatusType[] = sites.map((site: any): SiteStatusType => {
		// 解析每日可用性百分比
		const ranges = String(site.custom_uptime_ranges || "").split("-")
		const percent = Math.floor(Number(ranges.pop() || 0) * 100) / 100

		const dailyData: SiteDaysStatus[] = []
		const timeMap = new Map<string, number>()

		dates.forEach((date, index) => {
			timeMap.set(date.toString().replace(/-/g, ""), index)
			dailyData[index] = {
				date: date.toZonedDateTime("Asia/Shanghai").epochSeconds,
				percent: Math.floor(Number(ranges[index] || 0) * 100) / 100,
				down: { times: 0, duration: 0 },
			}
		})

		// 统计宕机记录
		const total = { times: 0, duration: 0 }
		site?.logs?.forEach((log: any) => {
			if (log?.type === 1 || log?.type === 99) {
				const logDate = Temporal.Instant.fromEpochSeconds(
					Number(log?.datetime),
				)
					.toZonedDateTimeISO("Asia/Shanghai")
					.plainDate.toString()
					.replace(/-/g, "")
				const dateIndex = timeMap.get(logDate)
				if (dateIndex !== undefined && dailyData[dateIndex]) {
					dailyData[dateIndex].down.times += 1
					dailyData[dateIndex].down.duration += Number(log.duration || 0)
				}
				total.times += 1
				total.duration += Number(log.duration || 0)
			}
		})

		return {
			id: site.id,
			name: site?.friendly_name || "未命名站点",
			url: showLink ? site?.url : undefined,
			status: (site?.status ?? 8) as SiteStatusType["status"],
			type: (site?.type ?? 1) as SiteStatusType["type"],
			interval: site?.interval ?? 0,
			percent,
			days: dailyData.reverse(),
			down: total,
		}
	})

	return {
		status: formatData.reduce(
			(acc, site) => {
				if (site.status === 2) acc.ok++
				else if (site.status === 8 || site.status === 9) acc.error++
				else if (site.status === 0 || site.status === 1) acc.unknown++
				return acc
			},
			{ count: formatData.length, ok: 0, error: 0, unknown: 0 },
		),
		data: formatData,
		timestamp: Date.now(),
	}
}
