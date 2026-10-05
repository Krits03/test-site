<script setup lang="ts">
import type { SiteStatusType, SiteStatus } from "~/types/status"
import { getSiteData } from "~/utils/status/helper"
import { formatTime, formatDuration, formatInterval } from "~/utils/status/time"
import { jumpLink } from "~/utils/status/helper"

const statusStore = useStatusStore()

// 站点状态映射
const statusMap: Record<number, { text: string; type: SiteStatus }> = {
	0: { text: "已暂停", type: "unknown" },
	1: { text: "未检测", type: "unknown" },
	2: { text: "正常", type: "normal" },
	8: { text: "异常", type: "error" },
	9: { text: "宕机", type: "error" },
}

// 检测类型映射
const typeMap: Record<number, { tag: string; text: string }> = {
	1: { tag: "HTTP", text: "发送 HTTP/HTTPS 请求检测目标可用性" },
	2: { tag: "KEYWORD", text: "检查页面内容是否包含指定关键词" },
	3: { tag: "PING", text: "使用 ICMP 协议发送 Ping 请求" },
	4: { tag: "PORT", text: "检测目标服务器指定端口是否开放" },
	5: { tag: "HEARTBEAT", text: "被监控服务主动发送心跳信号" },
}

// 全部站点数据
const siteData = computed<SiteStatusType[] | undefined>(
	() => statusStore.siteData?.data,
)

// 根据可用性百分比获取当天状态
function getDayStatus(percent: number): SiteStatus {
	if (percent >= 100) return "normal"
	if (percent >= 50) return "warn"
	if (percent > 0) return "error"
	return "unknown"
}

// 手动刷新
async function refresh() {
	statusStore.$patch({ siteStatus: "loading", siteData: undefined })
	await getSiteData()
}

onMounted(getSiteData)
</script>

<template>
	<div class="status-cards">
		<!-- 加载/错误状态 -->
		<div v-if="!siteData?.length" class="status-card loading-card">
			<div v-if="statusStore.siteStatus !== 'unknown'" class="loading-spinner" />
			<div v-else class="error-state">
				<p class="error-title">数据获取失败</p>
				<p class="error-desc">请检查 UptimeRobot API Key 配置或网络连接</p>
				<button class="retry-btn" @click="refresh">重新加载</button>
			</div>
		</div>

		<!-- 站点卡片列表 -->
		<div
			v-for="(site, index) in siteData"
			:key="site.id"
			class="status-card"
			:style="{ animationDelay: `${index * 0.08}s` }"
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
						<Icon name="tabler:external-link" />
					</a>
				</div>
				<div class="site-status-badge" :class="statusMap[site.status]?.type">
					<span v-if="site.status !== 0" class="status-dot" />
					<Icon v-else name="tabler:pause" :size="14" />
					<span>{{ statusMap[site.status]?.text }}</span>
				</div>
			</div>

			<!-- 每日可用性时间线 -->
			<div v-if="site?.days?.length" class="timeline">
				<div
					v-for="(day, dayIndex) in site.days"
					:key="day?.date || dayIndex"
					class="day-bar"
					:class="getDayStatus(day.percent)"
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
	gap: 12px;
}

.status-card {
	background: var(--c-card, #fff);
	border: 1px solid var(--c-border, rgba(0, 0, 0, 0.08));
	border-radius: var(--radius-card, 12px);
	padding: 16px 20px;
	opacity: 0;
	animation: status-float-up 0.5s forwards;
	transition: box-shadow 0.2s, transform 0.2s;
}

.status-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	transform: translateY(-1px);
}

.loading-card {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;
}

.loading-spinner {
	width: 36px;
	height: 36px;
	border: 3px solid var(--c-border, #e0e0e0);
	border-top-color: var(--c-primary, #41b883);
	border-radius: 50%;
	animation: status-spin 0.8s linear infinite;
}

.error-state {
	text-align: center;
}

.error-title {
	font-size: 18px;
	font-weight: 600;
	color: var(--c-text, #333);
	margin-bottom: 8px;
}

.error-desc {
	font-size: 13px;
	color: var(--c-text-secondary, #888);
	margin-bottom: 16px;
}

.retry-btn {
	padding: 8px 20px;
	border: 1px solid var(--c-primary, #41b883);
	background: transparent;
	color: var(--c-primary, #41b883);
	border-radius: 8px;
	cursor: pointer;
	font-size: 14px;
	transition: all 0.2s;
}

.retry-btn:hover {
	background: var(--c-primary, #41b883);
	color: #fff;
}

.card-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.card-title {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
	min-width: 0;
}

.site-name {
	font-weight: 600;
	font-size: 15px;
	color: var(--c-text, #333);
}

.site-type {
	font-size: 11px;
	padding: 2px 8px;
	background: var(--c-bg-soft, #f5f5f5);
	color: var(--c-text-secondary, #888);
	border-radius: 10px;
	white-space: nowrap;
	cursor: help;
}

.site-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 22px;
	height: 22px;
	color: var(--c-text-secondary, #888);
	border-radius: 4px;
	transition: all 0.2s;
}

.site-link:hover {
	color: var(--c-primary, #41b883);
	background: var(--c-bg-soft, #f5f5f5);
}

.site-link svg {
	width: 14px;
	height: 14px;
}

.site-status-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	font-weight: 500;
	padding: 4px 10px;
	border-radius: 12px;
	white-space: nowrap;
}

.site-status-badge.normal {
	color: #27ae60;
	background: rgba(39, 174, 96, 0.1);
}
.site-status-badge.error {
	color: #e74c3c;
	background: rgba(231, 76, 60, 0.1);
}
.site-status-badge.warn {
	color: #f39c12;
	background: rgba(243, 156, 18, 0.1);
}
.site-status-badge.unknown {
	color: #7f8c8d;
	background: rgba(127, 140, 141, 0.1);
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: currentColor;
	position: relative;
}

.status-dot::after {
	content: "";
	position: absolute;
	inset: 0;
	border-radius: 50%;
	background: currentColor;
	opacity: 0.4;
	animation: status-breathing 1.5s ease infinite;
}

.timeline {
	display: flex;
	gap: 2px;
	margin: 14px 0 10px;
}

.day-bar {
	flex: 1;
	height: 24px;
	border-radius: 4px;
	cursor: pointer;
	transition: transform 0.2s;
	min-width: 0;
}

.day-bar:hover {
	transform: scaleY(1.15);
}

.day-bar.normal {
	background: #2ecc71;
}
.day-bar.warn {
	background: #f39c12;
}
.day-bar.error {
	background: #e74c3c;
}
.day-bar.unknown {
	background: #bdc3c7;
}

.card-summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	font-size: 12px;
	color: var(--c-text-secondary, #999);
}

.summary-date {
	min-width: 80px;
}

.summary-date:last-child {
	text-align: right;
}

.summary-data {
	flex: 1;
	text-align: center;
}

@keyframes status-float-up {
	0% {
		opacity: 0;
		transform: translateY(16px);
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

@keyframes status-breathing {
	0% {
		transform: scale(1);
		opacity: 0.4;
	}
	100% {
		transform: scale(2.5);
		opacity: 0;
	}
}

@media (max-width: 640px) {
	.status-card {
		padding: 14px 16px;
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
