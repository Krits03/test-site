<script setup lang="ts">
import musicConfig from '~~/music.config'

const route = useRoute()
const contentPath = useContentPath().value

const { data: post } = await useAsyncData(
	`content:${contentPath}`,
	() => queryCollection('content').path(contentPath).first(),
)

const excerpt = computed(() => post.value?.description || '')
const asideWidgetNames = computed<WidgetName[]>(() => {
	if (!post.value)
		return ['blog-log']

	// 文章 frontmatter 显式指定的 aside 优先；播放器随后统一追加，便于边读边听
	const aside = (post.value.meta?.aside as WidgetName[] | undefined) ?? ['toc']
	if (!musicConfig.enable || aside.includes('music-player'))
		return aside
	return [...aside, 'music-player']
})
const { widgets } = useWidgets(asideWidgetNames)

if (post.value) {
	useSeoMeta({
		title: post.value.title,
		ogType: 'article',
		ogImage: post.value.image,
		description: post.value.description,
	})
}
else {
	const event = useRequestEvent()
	event && setResponseStatus(event, 404)
	route.meta.title = '404'
}
</script>

<template>
<template #aside>
	<!-- 每篇文章拥有独立的目录状态，并在具名插槽内自然入场。 -->
	<component :is="widget.comp" v-for="widget in widgets" :key="`${post?.path ?? route.path}:${widget.name}`" />
</template>

<template v-if="post">
	<PostHeader v-bind="post" />
	<PostExcerpt v-if="excerpt" :excerpt />
	<!-- 正文使用纯透明度入场，保证 URL 锚点和目录测量不受位移影响。 -->
	<ContentRenderer
		class="article"
		data-transition-enter
		:class="getPostTypeClassName(post?.type, { prefix: 'md' })"
		:value="post"
		tag="article"
	/>

	<PostFooter v-bind="post" />
	<PostSurround />
	<PostComment />
</template>

<ZError
	v-else
	icon="line-md:document-delete-twotone"
	title="内容为空或页面不存在"
>
	<template #operation>
		<ZButton primary to="/" icon="tabler:home" text="返回首页" />
	</template>
</ZError>
</template>
