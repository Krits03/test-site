<script setup lang="ts">
import { getSiteData, manualRefreshDelay } from "~/utils/status/helper"
import { formatTime } from "~/utils/status/time"
import { useStatusPublicConfig } from "~~/status.config"

const statusStore = useStatusStore()
const statusPublicConfig = useStatusPublicConfig()
const refreshInterval = statusPublicConfig.refreshInterval
const updateTime = ref(refreshInterval)

// 手动刷新节流：同一浏览器 1 分钟内只放行一次，错误态同样可以重试
const refreshing = ref(false)
const cooldownHint = ref("")

const nextUpdateTime = computed(() => {
	const time = updateTime.value
	const minutes = Math.floor(time / 60)
	const seconds = time % 60
	return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`
})

const statusMeta = computed(() => {
	const map = {
		loading: { text: "加载中", color: "var(--c-text-2)" },
		unknown: { text: "未知", color: "var(--c-text-2)" },
		normal: { text: "全部正常", color: "var(--c-success)" },
		error: { text: "部分异常", color: "var(--c-error)" },
		warn: { text: "存在告警", color: "var(--c-warning)" },
	}
	return map[statusStore.siteStatus] || map.unknown
})

const stats = computed(() => statusStore.siteData?.status)

async function runRefresh(force: boolean) {
	if (refreshing.value) return
	refreshing.value = true
	try {
		await getSiteData({ force })
	} finally {
		refreshing.value = false
	}
}

function refresh() {
	const wait = manualRefreshDelay(Date.now(), statusStore.lastManualAt)
	if (wait > 0) {
		cooldownHint.value = `请 ${Math.ceil(wait / 1000)} 秒后再刷新`
		return
	}
	cooldownHint.value = ""
	statusStore.lastManualAt = Date.now()
	// 手动刷新即视为新一轮周期，倒计时与“更新于”都重新起算
	updateTime.value = refreshInterval
	runRefresh(true)
}

useIntervalFn(
	() => {
		if (updateTime.value > 0) updateTime.value--
		if (updateTime.value === 0) {
			updateTime.value = refreshInterval
			// 自动刷新走服务端缓存，不用 force 回源，避免打爆 UptimeRobot 配额
			runRefresh(false)
		}
	},
	1000,
	{ immediate: true },
)
</script>

<template>
	<div class="status-overview card">
		<div class="overview-main">
			<div class="overview-status">
				<span class="status-dot" :style="{ backgroundColor: statusMeta.color }" />
				<span class="status-text" :style="{ color: statusMeta.color }">
					{{ statusMeta.text }}
				</span>
			</div>
			<div v-if="stats" class="overview-stats">
				<span class="stat-item">
					<span class="stat-value">{{ stats.count }}</span>
					<span class="stat-label">总数</span>
				</span>
				<span class="stat-divider" />
				<span class="stat-item ok">
					<span class="stat-value">{{ stats.ok }}</span>
					<span class="stat-label">正常</span>
				</span>
				<span class="stat-divider" />
				<span class="stat-item error">
					<span class="stat-value">{{ stats.error }}</span>
					<span class="stat-label">异常</span>
				</span>
				<span class="stat-divider" />
				<span class="stat-item unknown">
					<span class="stat-value">{{ stats.unknown }}</span>
					<span class="stat-label">未知</span>
				</span>
			</div>
		</div>
		<div class="overview-meta">
			<span v-if="statusStore.siteData?.timestamp" class="meta-item">
				更新于 {{ formatTime(statusStore.siteData.timestamp, { showTime: true, showOnlyTimeIfToday: true }) }}
			</span>
			<span class="meta-item">{{ nextUpdateTime }}后自动刷新</span>
			<span v-if="cooldownHint" class="meta-item cooldown-hint">{{ cooldownHint }}</span>
			<button
				class="refresh-btn"
				:class="{ 'is-loading': refreshing }"
				:disabled="refreshing"
				:title="refreshing ? '刷新中' : '手动刷新（1 分钟一次）'"
				@click="refresh"
			>
				<Icon name="tabler:refresh" :size="16" />
			</button>
		</div>
	</div>
</template>

<style scoped>
.status-overview {
	display: flex;
	flex-direction: column;
	gap: 0.8em;
	padding: 1em 1.2em;
	margin-bottom: 1em;
}

.overview-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1em;
	flex-wrap: wrap;
}

.overview-status {
	display: flex;
	align-items: center;
	gap: 0.5em;
}

.status-dot {
	width: 0.7em;
	height: 0.7em;
	border-radius: 50%;
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

.status-text {
	font-size: 1.1em;
	font-weight: 600;
}

.overview-stats {
	display: flex;
	align-items: center;
	gap: 0.8em;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.1em;
}

.stat-value {
	font-size: 1.3em;
	font-weight: 700;
	color: var(--c-text);
}

.stat-item.ok .stat-value { color: var(--c-success); }
.stat-item.error .stat-value { color: var(--c-error); }
.stat-item.unknown .stat-value { color: var(--c-text-2); }

.stat-label {
	font-size: 0.75em;
	color: var(--c-text-3);
}

.stat-divider {
	width: 1px;
	height: 1.5em;
	background: var(--c-border);
}

.overview-meta {
	display: flex;
	align-items: center;
	gap: 0.8em;
	font-size: 0.8em;
	color: var(--c-text-2);
	flex-wrap: wrap;
}

.meta-item {
	display: inline-flex;
	align-items: center;
}

.refresh-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.8em;
	height: 1.8em;
	padding: 0;
	border: 1px solid var(--c-border);
	border-radius: 0.4em;
	background: var(--c-bg-1);
	color: var(--c-text-2);
	cursor: pointer;
	transition: all 0.2s;
	margin-left: auto;
}

.refresh-btn:hover {
	color: var(--c-primary);
	border-color: var(--c-primary);
	background: var(--c-primary-soft);
}

.cooldown-hint {
	color: var(--c-warning);
}

.refresh-btn:disabled {
	cursor: default;
	opacity: 0.6;
}

.refresh-btn.is-loading :deep(svg) {
	animation: refresh-spin 0.8s linear infinite;
}

@keyframes refresh-spin {
	to { transform: rotate(360deg); }
}

@keyframes status-pulse {
	0% { transform: scale(1); opacity: 0.4; }
	100% { transform: scale(2.2); opacity: 0; }
}

@media (max-width: 640px) {
	.overview-stats {
		gap: 0.5em;
	}
	.stat-divider {
		height: 1.2em;
	}
	.stat-value {
		font-size: 1.1em;
	}
}
</style>
