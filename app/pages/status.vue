<script setup lang="ts">
const appConfig = useAppConfig()

useSeoMeta({
	title: "检测",
	ogType: "website",
	description: `${appConfig.title}的站点状态监测页面，实时展示各服务的在线状态与可用性。`,
})

// 状态页组件懒加载：ClientOnly 避免 SSR 渲染，Lazy 前缀按需加载代码
</script>

<template>
	<div class="status-page">
		<div class="hide-above-mobile">
			<BlogHeader to="/" suffix="检测" tag="h1" />
		</div>
		<ClientOnly>
			<template #default>
				<LazyStatusHeader />
				<LazyStatusCards />
			</template>
			<template #fallback>
				<div class="status-skeleton card">
					<div class="skeleton-line skeleton-title" />
					<div class="skeleton-row">
						<div class="skeleton-line" />
						<div class="skeleton-line" />
						<div class="skeleton-line" />
					</div>
				</div>
				<div class="status-skeleton card">
					<div class="skeleton-line skeleton-title" />
					<div class="skeleton-bar" />
				</div>
			</template>
		</ClientOnly>
	</div>
</template>

<style scoped>
.status-page {
	display: flex;
	flex-direction: column;
	gap: 0;
}

/* PC 横屏时 BlogHeader 被隐藏，预留顶部空间，与 FeedGroup 的 2em 间距一致 */
@media not (max-width: 768px) {
	.status-page {
		padding-top: 2em;
	}
}

/* 懒加载骨架屏 */
.status-skeleton {
	padding: 1em 1.2em;
	margin-bottom: 0.8em;
}

.skeleton-line {
	height: 1em;
	background: var(--c-bg-2);
	border-radius: 0.3em;
	animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-title {
	width: 30%;
	height: 1.2em;
	margin-bottom: 0.8em;
}

.skeleton-row {
	display: flex;
	gap: 0.8em;
}

.skeleton-row .skeleton-line {
	flex: 1;
	height: 2em;
}

.skeleton-bar {
	height: 1.4em;
	background: var(--c-bg-2);
	border-radius: 0.3em;
	animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
	0%, 100% { opacity: 0.4; }
	50% { opacity: 0.8; }
}
</style>
