<script setup lang="ts">
const appConfig = useAppConfig()

const siteInfo = [
	{ label: '上线时间', value: appConfig.timeEstablished, tip: `已运行 ${timeElapse(appConfig.timeEstablished)}` },
	{ label: '主题', value: 'Clarity' },
	{ label: '域名', value: getDomain(appConfig.url) },
	{ label: '评论', value: 'Twikoo + giscus' },
	{ label: '协议', value: appConfig.copyright.abbr },
]
</script>

<template>
<BlogWidget card title="站点信息">
	<ZDlGroup :items="siteInfo" />
</BlogWidget>
</template>
