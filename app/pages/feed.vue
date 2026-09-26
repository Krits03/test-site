<script setup lang="ts">
import type { NavItem } from '~/types/nav'
import { orderBy } from 'es-toolkit/array'
import blogConfig from '~~/blog.config'

const appConfig = useAppConfig()

useSeoMeta({
	title: '订阅',
	description: `${appConfig.title}的 Atom 订阅源，可复制地址到任意阅读器，也可下载友链 OPML 订阅列表。`,
})

const atomUrl = new URL('/atom.xml', blogConfig.url).toString()
const opmlUrl = new URL('/subscriptions.opml', blogConfig.url).toString()

/** 阅读器入口，方便访客一键添加订阅 */
const readers: NavItem[] = [
	{ icon: 'tabler:news', text: 'Feedly', url: `https://feedly.com/i/subscription/feed/${encodeURIComponent(atomUrl)}` },
	{ icon: 'tabler:inbox', text: 'Inoreader', url: `https://www.inoreader.com/?add_feed=${encodeURIComponent(atomUrl)}` },
	{ icon: 'tabler:rss', text: 'Follow', url: `https://app.follow.is/search/feeds?query=${encodeURIComponent(atomUrl)}` },
]

const { data: listRaw } = await useAsyncData('posts:index', () => queryArticleIndex(), { default: () => [] })
const listFeed = computed(() => orderBy(listRaw.value, ['updated', 'date'], ['desc']).slice(0, blogConfig.feed.limit))
</script>

<template>
<template #aside>
	<WidgetBlogStats />
</template>

<BlogHeader class="hide-above-mobile" to="/" suffix="订阅" tag="h1" />

<div class="feed-page">
	<section class="feed-hero card">
		<div class="hero-icon">
			<Icon name="tabler:rss" />
		</div>

		<div class="hero-text">
			<h2 class="text-creative">
				{{ appConfig.title }}
			</h2>
			<p>{{ appConfig.subtitle || appConfig.description }}</p>
			<p class="hero-tip">
				用任意支持 <b>Atom</b> 的阅读器订阅本站，新文章发布后会自动推送，无需重复访问。
			</p>
		</div>

		<menu class="hero-readers">
			<UtilLink
				v-for="reader in readers"
				:key="reader.text"
				class="reader-card gradient-card"
				:to="reader.url"
			>
				<Icon :name="reader.icon" />
				<span>{{ reader.text }}</span>
			</UtilLink>
		</menu>

		<div class="hero-copy">
			<Copy prompt="Atom 订阅" :code="atomUrl" />
			<Copy prompt="OPML 列表" :code="opmlUrl" />
		</div>

		<div class="hero-actions">
			<ZButton primary to="/atom.xml" icon="tabler:code" text="查看原始 XML" />
			<ZButton external to="/subscriptions.opml" icon="tabler:list-details" text="友链订阅" />
		</div>
	</section>

	<section class="feed-recent">
		<h2 class="section-title">
			<Icon name="tabler:clock-hour-4" />
			最新文章
		</h2>
		<p class="section-desc">
			按更新时间倒序，与订阅源推送内容一致（最多 {{ blogConfig.feed.limit }} 篇）。
		</p>

		<menu class="proper-height">
			<PostArticle
				v-for="article, index in listFeed"
				:key="article.path"
				v-bind="article"
				:to="article.path"
				use-updated
				:style="getFixedDelay(index * 0.04)"
			/>
		</menu>
	</section>
</div>
</template>

<style scoped>
.feed-page {
	margin: 1rem;
}

.feed-hero {
	display: grid;
	gap: 1em;
	/* 阻止装饰性图标溢出 */
	overflow: hidden;
	padding: 1.5em;

	.hero-icon {
		display: grid;
		place-items: center;
		width: 3em;
		height: 3em;
		border-radius: 1em;
		background: linear-gradient(135deg, var(--c-primary-soft), transparent);
		font-size: 1.6em;
		color: var(--c-primary);
	}
}

.hero-text {
	> h2 {
		margin-bottom: 0.3em;
		font-size: 1.6em;
	}

	> p {
		color: var(--c-text-2);
	}

	.hero-tip {
		margin-top: 0.5em;
	}
}

.hero-readers {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5em;

	.reader-card {
		display: flex;
		align-items: center;
		gap: 0.3em;
		padding: 0.4em 0.8em;
		border-radius: 2em;
		box-shadow: var(--box-shadow-1);
		background-color: var(--c-bg-1);
		font-size: 0.9em;
		transition: transform 0.2s;

		&:hover {
			transform: translateY(-2px);
		}
	}
}

.hero-copy {
	display: grid;
	gap: 0.2em;
}

.hero-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5em;
}

.feed-recent {
	margin-top: 2em;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.3em;
	font-size: 1.3em;
}

.section-desc {
	margin: 0.3em 0 1em;
	font-size: 0.9em;
	color: var(--c-text-2);
}
</style>
