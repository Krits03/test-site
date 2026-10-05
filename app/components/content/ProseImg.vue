<script setup lang="ts">
// 接管 markdown 中的 <img>，为其加入「加载占位 + 懒加载」。
// 移植自 hexo-theme-redefine 的 lazyload 占位思路：
// redefine 用构建期把 src 换成 loading.svg + IntersectionObserver 懒加载；
// Nuxt 下浏览器原生 loading="lazy" 已覆盖懒加载，这里只需补一层 shimmer 占位骨架。
// 使用原生 <img> 而非 <NuxtImg>：保持与当前 markdown 图片一致的原始行为，
// 避免 @nuxt/image 把模板 img 自动转成默认 ipx 提供方（远程图在静态部署下会走 /_ipx 而 404）。
const props = withDefaults(defineProps<{
	src?: string
	alt?: string
	title?: string
	width?: string | number
	height?: string | number
}>(), {
	alt: '',
})

const loaded = ref(false)
const errored = ref(false)
const imgEl = ref<HTMLImageElement>()

// 行内小图标（如 .icon）无需占位骨架，直接跳过，保持原样
const attrs = useAttrs()
const isIcon = computed(() => /\bicon\b/.test(String(attrs.class ?? '')))
const showPlaceholder = computed(() => !isIcon.value)

// 图片提供了 width/height 时，浏览器会自动按真实比例占位；否则用默认比例
const hasDim = computed(() => {
	const w = Number(props.width)
	const h = Number(props.height)
	return w > 0 && h > 0
})
const ratioStyle = computed(() =>
	hasDim.value
		? { aspectRatio: `${Number(props.width)} / ${Number(props.height)}` }
		: undefined,
)

// 图片可能在挂载前就已缓存完成（@load 不会再触发），需挂载后主动校验
onMounted(() => {
	if (import.meta.client && imgEl.value?.complete && imgEl.value.naturalWidth > 0)
		loaded.value = true
})
</script>

<template>
	<img
		ref="imgEl"
		:src="src"
		:alt="alt"
		:title="title"
		:width="width"
		:height="height"
		loading="lazy"
		decoding="async"
		class="prose-img"
		:class="{
			'prose-img--loading': showPlaceholder && !loaded && !errored,
			'prose-img--no-dim': showPlaceholder && !hasDim,
			'prose-img--loaded': loaded,
		}"
		:style="ratioStyle"
		@load="loaded = true"
		@error="errored = true"
	>
</template>
