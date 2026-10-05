// site status page types

export type SiteStatus = "loading" | "warn" | "error" | "unknown" | "normal"

export interface SiteDaysStatus {
	date?: number
	percent: number
	down: {
		times: number
		duration: number
	}
}

export interface SiteStatusType extends SiteDaysStatus {
	id: number
	name: string
	// 0 - 暂停 / 1 - 未检查 / 2 - 正常 / 8 - 异常 / 9 - 宕机
	status: 0 | 1 | 2 | 8 | 9
	// 1 - HTTP(s) / 2 - Keyword / 3 - Ping / 4 - Port / 5 - Heartbeat
	type: 1 | 2 | 3 | 4 | 5
	interval: number
	days: SiteDaysStatus[]
	url?: string
}

export interface MonitorsDataResult {
	status: {
		count: number
		ok: number
		error: number
		unknown: number
	}
	data: SiteStatusType[]
	timestamp: number
}

export interface MonitorsResult {
	code: number
	message: string
	source: "cache" | "api"
	data: MonitorsDataResult | undefined
}
