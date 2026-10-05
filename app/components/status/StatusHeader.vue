<script setup lang="ts">
import { getSiteData } from "~/utils/status/helper"
import { formatTime } from "~/utils/status/time"
import { statusPublicConfig } from "~/app/config/status.config"

const statusStore = useStatusStore()

// 自动刷新间隔（秒，从配置读取）
const refreshInterval = statusPublicConfig.refreshInterval

// 自动刷新倒计时
const updateTime = ref(refreshInterval)
const nextUpdateTime = computed(() => {
	const time = updateTime.value
	const minutes = Math.floor(time / 60)
	const seconds = time % 60
	return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`
})

// 状态文本映射
const statusText = computed(() => ({
	loading: "加载中...",
	unknown: "状态未知",
	normal: "全部正常",
	error: "部分异常",
	warn: "存在告警",
}))

// 手动刷新
async function refresh() {
	const lastUpdate = statusStore.siteData?.timestamp || 0
	if (!lastUpdate) return
	if (Date.now() - lastUpdate < refreshInterval * 1000) {
		return
	}
	updateTime.value = refreshInterval
	await getSiteData()
}

// 自动倒计时刷新
useIntervalFn(
	() => {
		if (updateTime.value > 0) updateTime.value--
		if (updateTime.value === 0) {
			statusStore.siteStatus = "loading"
			getSiteData()
			updateTime.value = refreshInterval
		}
	},
	1000,
	{ immediate: true },
)
</script>

<template>
	<header class="status-header" :class="statusStore.siteStatus">
		<div class="status-cover" :class="statusStore.siteStatus" />
		<div class="status-content">
			<div class="site-status">
				<div class="status-text">
					<div class="point" :class="statusStore.siteStatus" />
					<div class="text">
						<span class="title">{{ statusText[statusStore.siteStatus] }}</span>
						<span v-if="statusStore.siteStatus === 'loading'" class="tip">
							正在获取站点数据...
						</span>
						<span v-else-if="statusStore.siteStatus === 'unknown'" class="tip">
							数据获取失败，请稍后重试
						</span>
						<span v-else class="tip">
							<span>
								更新于
								{{
									formatTime(statusStore.siteData?.timestamp || 0, {
										showTime: true,
										showOnlyTimeIfToday: true,
									})
								}}
							</span>
							<span>{{ nextUpdateTime }}后自动刷新</span>
							<button class="refresh-btn" @click="refresh" title="手动刷新">
								<Icon name="tabler:refresh" />
							</button>
						</span>
					</div>
				</div>
			</div>
		</div>
		<!-- 波纹 -->
		<svg class="waves-area" viewBox="0 24 150 28" preserveAspectRatio="none">
			<defs>
				<path
					id="status-gentle-wave"
					d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -352 Z"
				/>
			</defs>
			<g class="parallax">
				<use href="#status-gentle-wave" x="48" y="0" />
				<use href="#status-gentle-wave" x="48" y="3" />
				<use href="#status-gentle-wave" x="48" y="5" />
				<use href="#status-gentle-wave" x="48" y="7" />
			</g>
		</svg>
	</header>
</template>

<style scoped>
.status-header {
	position: relative;
	height: 320px;
	width: 100%;
	color: #fff;
	border-radius: var(--radius-card, 12px);
	overflow: hidden;
	margin-bottom: 1rem;
}

.status-cover {
	position: absolute;
	inset: 0;
	background-size: 400% 400%;
	z-index: 0;
	transition: background 0.5s ease;
}

.status-cover.loading {
	background: radial-gradient(circle, #00c6ff, #0072ff, #00d2ff, #00b0ff);
}
.status-cover.normal {
	background: radial-gradient(circle, #2ecc71, #27ae60, #16a085, #1abc9c);
}
.status-cover.error {
	background: radial-gradient(circle, #ff4b5c, #ff2a3b, #ff6f5e, #f15239);
}
.status-cover.warn {
	background: radial-gradient(circle, #ffa500, #ff8c00, #ff7f00, #ff6600);
}
.status-cover.unknown {
	background: radial-gradient(circle, #7f8c8d, #b5b5b5, #858c8d, #34495e);
}

.status-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	padding: 40px 32px 80px;
}

.site-status {
	display: flex;
	align-items: flex-end;
	height: 100%;
}

.status-text {
	display: flex;
	align-items: center;
	margin-bottom: 12px;
}

.point {
	position: relative;
	width: 36px;
	height: 36px;
	min-width: 36px;
	background-color: #fff;
	border-radius: 50%;
	margin-right: 24px;
}

.point::after {
	content: "";
	position: absolute;
	inset: 0;
	background-color: rgba(255, 255, 255, 0.5);
	border-radius: 50%;
	z-index: -1;
	animation: status-breathing 1.5s ease infinite;
}

.text {
	display: flex;
	flex-direction: column;
}

.title {
	font-size: 32px;
	font-weight: 700;
	line-height: 1.2;
}

.tip {
	font-size: 13px;
	opacity: 0.85;
	margin-top: 6px;
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
}

.tip > span:first-child::after {
	content: "|";
	font-size: 11px;
	margin-left: 10px;
	opacity: 0.5;
}

.refresh-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	padding: 0;
	border: none;
	background: transparent;
	color: #fff;
	cursor: pointer;
	border-radius: 4px;
	transition: background 0.2s;
}

.refresh-btn:hover {
	background: rgba(255, 255, 255, 0.15);
}

.refresh-btn svg {
	width: 16px;
	height: 16px;
}

.waves-area {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 50px;
	z-index: 1;
	pointer-events: none;
}

.parallax > use {
	animation: status-move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
	animation-delay: -2s;
	animation-duration: 7s;
	fill: rgba(255, 255, 255, 0.3);
}
.parallax > use:nth-child(2) {
	animation-delay: -3s;
	animation-duration: 10s;
	fill: rgba(255, 255, 255, 0.2);
}
.parallax > use:nth-child(3) {
	animation-delay: -4s;
	animation-duration: 13s;
	fill: rgba(255, 255, 255, 0.1);
}
.parallax > use:nth-child(4) {
	animation-delay: -5s;
	animation-duration: 20s;
	fill: var(--c-bg, #f7f7f7);
}

@keyframes status-breathing {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	100% {
		transform: scale(2);
		opacity: 0;
	}
}

@keyframes status-move-forever {
	0% {
		transform: translate3d(-90px, 0, 0);
	}
	100% {
		transform: translate3d(85px, 0, 0);
	}
}

@media (max-width: 640px) {
	.status-header {
		height: 240px;
	}
	.status-content {
		padding: 24px 20px 60px;
	}
	.title {
		font-size: 24px;
	}
	.point {
		width: 28px;
		height: 28px;
		min-width: 28px;
		margin-right: 16px;
	}
}
</style>
