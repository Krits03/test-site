<script setup lang="ts">
const { slots } = provideLayoutSlots()
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
	grid-template-columns: var(--sidebar-width) minmax(0, 1fr) var(--aside-width);
	align-items: start;
	column-gap: 1rem;
	width: 100%;
	min-width: 0;
	max-width: calc(var(--aside-width) + 1rem + 1080px);
	margin-inline: auto;

	&:not(:has(> .blog-aside-track > #blog-aside:not(.is-empty))) {
		grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
	}

	@media (max-width: 1080px) {
		--sidebar-width: clamp(240px, 25vw, var(--aside-width));

		&, &:not(:has(> .blog-aside-track > #blog-aside:not(.is-empty))) {
			grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
		}
	}

	@media (max-width: 768px) {
		&, &:not(:has(> .blog-aside-track > #blog-aside:not(.is-empty))) {
			grid-template-columns: minmax(0, 1fr);
		}
	}
}

/* Chrome 100 及以下不支持 :has()：上面的 :has() 规则（含其 media 断点）会整条失效，
   这里用 @supports 隔离出 auto 轨道方案，让 aside 有无自动伸缩，避免窄屏布局错乱。
   支持 :has() 的浏览器不进入此分支，行为与原版完全一致。 */
@supports not selector(:has(*)) {
	#blog-root {
		grid-template-columns: var(--sidebar-width) minmax(0, 1fr) auto;

		@media (max-width: 1080px) {
			grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
		}

		@media (max-width: 768px) {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	/* 宽屏时 aside 自带宽度撑起 auto 轨道；无 aside 时该轨道坍缩为 0，自然回到两列。 */
	@media not (max-width: 1080px) {
		#blog-aside { width: var(--aside-width); }
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
		&:has(> #blog-aside:not(.is-empty)) {
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
