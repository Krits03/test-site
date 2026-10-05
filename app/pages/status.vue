<script setup lang="ts">
const appConfig = useAppConfig()

useSeoMeta({
	title: '检测',
	ogType: 'website',
	description: `${appConfig.title}的站点状态监测页面，实时展示各服务的在线状态与可用性。`,
})
</script>

<template>
	<div class="status-page">
		<div class="hide-above-mobile">
			<BlogHeader to="/" suffix="检测" tag="h1" />
		</div>
		<div class="status-iframe-wrapper">
			<iframe
				src="https://status.wkr-dev.top/"
				title="站点状态监测"
				class="status-iframe"
				loading="lazy"
				referrerpolicy="no-referrer"
			/>
		</div>
	</div>
</template>

<style scoped>
.status-page {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.status-iframe-wrapper {
	position: relative;
	width: 100%;
	border-radius: var(--radius-card, 12px);
	overflow: hidden;
	background: var(--c-card, #fff);
	border: 1px solid var(--c-border, rgba(0, 0, 0, 0.08));
	box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.06));
}

.status-iframe {
	display: block;
	width: 100%;
	height: 80vh;
	min-height: 600px;
	border: none;
}

@media (max-width: 768px) {
	.status-iframe {
		height: 70vh;
		min-height: 480px;
	}
}
</style>
