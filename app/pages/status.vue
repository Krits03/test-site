<script setup lang="ts">
const appConfig = useAppConfig()

useSeoMeta({
	title: "检测",
	ogType: "website",
	description: `${appConfig.title}的站点状态监测页面，实时展示各服务的在线状态与可用性。`,
})
</script>

<template>
	<div class="status-page">
		<div class="hide-above-mobile">
			<BlogHeader to="/" suffix="检测" tag="h1" />
		</div>
		<StatusHeader />
		<StatusCards />
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
</style>
