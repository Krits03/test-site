<script setup lang="ts">
import type { SiteStatusType, SiteStatus } from "~/types/status"
import { getSiteData } from "~/utils/status/helper"
import { formatTime, formatDuration, formatInterval } from "~/utils/status/time"

const statusStore = useStatusStore()

const statusMap: Record<number, { text: string; type: SiteStatus }> = {
	0: { text: "已暂停", type: "unknown" },
	1: { text: "未检测", type: "unknown" },
	2: { text: "正常", type: "normal" },
	8: { text: "异常", type: "error" },
	9: { text: "宕机", type: "error" },
}

const typeMap: Record<number, { tag: string; text: string }> = {
	1: { tag: "HTTP", text: "发送 HTTP/HTTPS 请求检测目标可用性" },
	2: { tag: "KEYWORD", text: "检查页面内容是否包含指定关键词" },
	3: { tag: "PING", text: "使用 ICMP 协议发送 Ping 请求" },
	4: { tag: "PORT", text: "检测目标服务器指定端口是否开放" },
	5: { tag: "HEARTBEAT", text: "被监控服务主动发送心跳信号" },
}

const siteData = computed<SiteStatusType[] | undefined>(
	() => statusStore.siteData?.data,
)

function getDayStatus(percent: number): SiteStatus {
	if (percent >= 100) return "normal"
	if (percent >= 50) return "warn"
	if (percent > 0) return "error"
	return "unknown"
}

function statusColor(type: SiteStatus): string {
	const map: Record<SiteStatus, string> = {
		normal: "var(--c-success)",
		error: "var(--c-error)",
		warn: "var(--c-warning)",
		unknown: "var(--c-text-3)",
		loading: "var(--c-text-2)",
	}
	return map[type]
}

async function refresh() {
	statusStore.$patch({ siteStatus: "loading", siteData: undefined })
	await getSiteData()
}

onMounted(getSiteData)
</script>

<template>
	<div class="status-cards">
		<!-- 加载/错误状态 -->
		<div v-if="!siteData?.length" class="status-card card loading-card">
			<div v-if="statusStore.siteStatus !== 'unknown'" class="loading-spinner" />
			<div v-else class="error-state">
				<p class="error-title">数据获取失败</p>
				<p class="error-desc">请检查 STATUS_API_KEY 配置或网络连接</p>
				<button class="retry-btn" @click="refresh">重新加载</button>
			</div>
		</div>

		<!-- 站点卡片列表 -->
		<div
			v-for="(site, index) in siteData"
			:key="site.id"
			class="status-card card upraise"
			:style="{ animationDelay: `${index * 0.06}s` }"
		>
			<!-- 顶部信息 -->
			<div class="card-meta">
				<div class="card-title">
					<span class="site-name">{{ site.name }}</span>
					<span class="site-type" :title="typeMap[site.type]?.text">
						{{ typeMap[site.type]?.tag || "HTTP" }} · {{ formatInterval(site.interval) }}
					</span>
					<a
						v-if="site?.url"
						class="site-link"
						:href="site.url"
						target="_blank"
						rel="noopener noreferrer"
						title="访问站点"
					>
						<Icon name="tabler:external-link" :size="14" />
					</a>
				</div>
				<div
					class="site-status-badge"
					:style="{
						color: statusColor(statusMap[site.status]?.type),
						backgroundColor: statusMap[site.status]?.type === 'normal' ? 'var(--c-success-soft)' : statusMap[site.status]?.type === 'error' ? 'var(--c-error-soft)' : statusMap[site.status]?.type === 'warn' ? 'var(--c-warning-soft)' : 'var(--c-bg-2)',
					}"
				>
					<span v-if="site.status !== 0" class="status-dot" />
					<Icon v-else name="tabler:pause" :size="12" />
					<span>{{ statusMap[site.status]?.text }}</span>
				</div>
			</div>

			<!-- 每日可用性时间线 -->
			<div v-if="site?.days?.length" class="timeline">
				<div
					v-for="(day, dayIndex) in site.days"
					:key="day?.date || dayIndex"
					class="day-bar"
					:style="{ backgroundColor: statusColor(getDayStatus(day.percent)) }"
					:title="`${day?.date ? formatTime(day.date) : '未知日期'}\n可用性: ${day.percent}%\n${day.down.times > 0 ? `宕机 ${day.down.times} 次 / ${formatDuration(day.down.duration)}` : '无宕机记录'}`"
				/>
			</div>

			<!-- 底部统计 -->
			<div class="card-summary">
				<span class="summary-date">
					{{ formatTime(site?.days?.[site.days.length - 1]?.date || 0) }}
				</span>
				<span v-if="site?.down?.times" class="summary-data">
					共 {{ site.days.length }} 天 · 宕机 {{ site.down.times }} 次 /
					{{ formatDuration(site.down.duration) }} · 可用性 {{ site.percent }}%
				</span>
				<span v-else class="summary-data">
					共 {{ site.days.length }} 天 · 可用性 {{ site.percent }}%
				</span>
				<span class="summary-date">今天</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.status-cards {
	display: flex;
	flex-direction: column;
	gap: 0.8em;
}

.status-card {
	padding: 1em 1.2em;
	opacity: 0;
	animation: status-fade-up 0.4s forwards;
}

.loading-card {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 12em;
	opacity: 1;
	animation: none;
}

.loading-spinner {
	width: 2em;
	height: 2em;
	border: 2px solid var(--c-border);
	border-top-color: var(--c-primary);
	border-radius: 50%;
	animation: status-spin 0.8s linear infinite;
}

.error-state {
	text-align: center;
}

.error-title {
	font-size: 1em;
	font-weight: 600;
	color: var(--c-text);
	margin-bottom: 0.3em;
}

.error-desc {
	font-size: 0.85em;
	color: var(--c-text-2);
	margin-bottom: 1em;
}

.retry-btn {
	padding: 0.4em 1.2em;
	border: 1px solid var(--c-primary);
	background: transparent;
	color: var(--c-primary);
	border-radius: 0.4em;
	cursor: pointer;
	font-size: 0.85em;
	transition: all 0.2s;
}

.retry-btn:hover {
	background: var(--c-primary);
	color: var(--c-bg);
}

.card-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.8em;
	margin-bottom: 0.8em;
}

.card-title {
	display: flex;
	align-items: center;
	gap: 0.5em;
	flex-wrap: wrap;
	min-width: 0;
}

.site-name {
	font-weight: 600;
	font-size: 0.95em;
	color: var(--c-text);
}

.site-type {
	font-size: 0.7em;
	padding: 0.15em 0.6em;
	background: var(--c-bg-2);
	color: var(--c-text-2);
	border-radius: 1em;
	white-space: nowrap;
	cursor: help;
}

.site-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.6em;
	height: 1.6em;
	color: var(--c-text-3);
	border-radius: 0.3em;
	transition: all 0.2s;
}

.site-link:hover {
	color: var(--c-primary);
	background: var(--c-primary-soft);
}

.site-status-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.4em;
	font-size: 0.8em;
	font-weight: 500;
	padding: 0.25em 0.7em;
	border-radius: 1em;
	white-space: nowrap;
	flex-shrink: 0;
}

.status-dot {
	width: 0.5em;
	height: 0.5em;
	border-radius: 50%;
	background: currentColor;
	position: relative;
	flex-shrink: 0;
}

.status-dot::after {
	content: "";
	position: absolute;
	inset: 0;
	border-radius: 50%;
	background: currentColor;
	opacity: 0.4;
	animation: status-pulse 1.5s ease infinite;
}

.timeline {
	display: flex;
	gap: 2px;
	margin: 0.6em 0;
}

.day-bar {
	flex: 1;
	height: 1.4em;
	border-radius: 0.2em;
	cursor: pointer;
	transition: transform 0.2s;
	min-width: 0;
	opacity: 0.85;
}

.day-bar:hover {
	transform: scaleY(1.2);
	opacity: 1;
}

.card-summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.8em;
	font-size: 0.75em;
	color: var(--c-text-3);
	margin-top: 0.6em;
}

.summary-date {
	min-width: 5em;
}

.summary-date:last-child {
	text-align: right;
}

.summary-data {
	flex: 1;
	text-align: center;
}

@keyframes status-fade-up {
	0% {
		opacity: 0;
		transform: translateY(0.8em);
	}
	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes status-spin {
	to {
		transform: rotate(360deg);
	}
}

@keyframes status-pulse {
	0% {
		transform: scale(1);
		opacity: 0.4;
	}
	100% {
		transform: scale(2.2);
		opacity: 0;
	}
}

@media (max-width: 640px) {
	.status-card {
		padding: 0.8em 1em;
	}
	.card-summary {
		flex-wrap: wrap;
	}
	.summary-data {
		order: 3;
		width: 100%;
		text-align: left;
	}
}
</style>
