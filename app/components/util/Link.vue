<script setup lang="ts">
defineProps<{
	to?: string
	/** 站内链接但在新标签页打开（如 .opml 等 isExtLink 识别不到的静态文件） */
	external?: boolean
}>()
</script>

<template>
<a v-if="to?.startsWith('#')" :href="to"><slot /></a>
<span v-else-if="typeof to === 'undefined'"><slot /></span>
<NuxtLink v-else :to :target="external || isExtLink(to) ? '_blank' : undefined">
	<slot />
</NuxtLink>
</template>
