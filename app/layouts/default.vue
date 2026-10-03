<script setup lang="ts">
const { slots } = provideLayoutSlots()

// 用「是否含 aside 插槽」驱动 <html> 的 has-aside class，
// 替代 CSS :has()（Chrome 105+ 才支持），以兼容 Chrome 100+。
const hasAside = computed(() => !!slots.value?.aside)
useHead({
	htmlAttrs: {
		class: computed(() => ({ 'has-aside': hasAside.value })),
	},
})
</script>

<template>
<!-- 加载进度条沿用主题青色（两端实色，保证低速加载时也可见） -->
<NuxtLoadingIndicator color="repeating-linear-gradient(to right, var(--c-primary) 0%, var(--c-primary-soft) 50%, var(--c-primary) 100%)" />
<NuxtRouteAnnouncer :style="{ position: 'absolute' }" />
<BlogSkipToContent />
<BlogSidebar />
<main id="main-content">
	<slot />
</main>
<!-- 与正文同高的容器限制侧栏 sticky 边界，让页脚进入视口时将侧栏向上顶走。 -->
<div class="blog-aside-track">
	<BlogAside>
		<slot name="aside" />
	</BlogAside>
</div>
<BlogFooter />
<BlogPanel :has-aside="!!slots?.aside" />
<BikariyaModals />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style>
#blog-root {
	--aside-width: 280px;
	--sidebar-width: var(--aside-width);

	display: grid;
	/* 默认两列：无 aside 的页面（404、标签页等）不留空右栏。
	   :has() 需 Chrome 105+，改用 html.has-aside class 兼容 Chrome 100+。 */
	grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
	align-items: start;
	column-gap: 1rem;
	width: 100%;
	min-width: 0;
	max-width: calc(var(--aside-width) + 1rem + 1080px);
	margin-inline: auto;

	/* 有 aside 时恢复三列 */
	html.has-aside & {
		grid-template-columns: var(--sidebar-width) minmax(0, 1fr) var(--aside-width);
	}

	@media (max-width: 1080px) {
		--sidebar-width: clamp(240px, 25vw, var(--aside-width));
		grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
	}

	@media (max-width: 768px) {
		grid-template-columns: minmax(0, 1fr);
	}
}

#blog-sidebar, #blog-aside {
	position: sticky;
	top: 0;
	height: 100vh;
	height: 100dvh;
	min-width: 0;
	scrollbar-width: thin;
}

#blog-sidebar {
	grid-area: 1 / 1;
}

#main-content {
	grid-area: 1 / 2;
	/* 保留语义 main 和可见溢出，不影响正文内的 sticky 元素。 */
	min-width: 0;

	:root[data-article-transition] & { view-transition-name: article-body; }

	@media (max-width: 768px) {
		grid-column: 1;
	}
}

.blog-aside-track {
	display: contents;

	@media not (max-width: 1080px) {
		html.has-aside & {
			display: block;
			grid-area: 1 / 3;
			align-self: stretch;
			min-width: 0;
		}
	}
}

#blog-root > .blog-footer {
	grid-area: 2 / 2 / auto / -1;
	min-width: 0;

	@media (max-width: 768px) {
		grid-column: 1 / -1;
	}
}
</style>
