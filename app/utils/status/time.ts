/**
 * 时间格式化工具（基于 Temporal，替代 dayjs）
 */

interface FormatTimeOptions {
	showTime?: boolean
	showOnlyTimeIfToday?: boolean
}

/**
 * 格式化时间戳为可读字符串
 */
export function formatTime(
	time: number,
	options: FormatTimeOptions = {},
): string {
	if (!time) return "未知时间"
	const { showTime = false, showOnlyTimeIfToday = false } = options
	const correctedTime = time < 1e10 ? time * 1000 : time

	const instant = Temporal.Instant.fromEpochMilliseconds(correctedTime)
	const zoned = instant.toZonedDateTimeISO("Asia/Shanghai")
	const today = Temporal.Now.zonedDateTime("Asia/Shanghai").plainDate

	if (showOnlyTimeIfToday && zoned.plainDate.equals(today)) {
		return zoned.toPlainTime().toString().slice(0, 8)
	}

	if (showTime) {
		return `${zoned.plainDate.toString()} ${zoned.toPlainTime().toString().slice(0, 8)}`
	}
	return zoned.plainDate.toString()
}

/**
 * 格式化时长（秒 → 可读字符串）
 */
export function formatDuration(seconds: number): string {
	const days = Math.floor(seconds / 86400)
	const hours = Math.floor((seconds % 86400) / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60

	const parts: string[] = []
	if (days > 0) parts.push(`${days}天`)
	if (hours > 0 || days > 0) parts.push(`${hours}时`)
	if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}分`)
	parts.push(`${secs}秒`)

	return parts.join(" ")
}

/**
 * 格式化检测间隔
 */
export function formatInterval(interval: number): string {
	if (interval >= 3600) {
		const hours = Math.floor(interval / 3600)
		const minutes = Math.floor((interval % 3600) / 60)
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
	}
	if (interval >= 60) {
		const minutes = Math.floor(interval / 60)
		const seconds = interval % 60
		return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
	}
	return `${interval}s`
}
