<script setup lang="ts">
import type { ArticleProps } from '~/types/article'
import type { NavItem } from '~/types/nav'
import { groupBy, orderBy } from 'es-toolkit/array'
import blogConfig from '~~/blog.config'

const appConfig = useAppConfig()

useSeoMeta({
	title: '站点地图',
	description: `${appConfig.title}的站点地图，收录全部页面与文章，同时提供可供搜索引擎与软件读取的 XML 站点地图。`,
})

const sitemapUrl = new URL('/sitemap.xml', blogConfig.url).toString()

/** 站点主要页面：取自侧栏导航，并补充订阅入口 */
const pages: NavItem[] = [
	...appConfig.nav.flatMap(group => group.items),
	{ icon: 'tabler:rss', text: '订阅', url: '/feed' },
	{ icon: 'tabler:file-code', text: 'XML 站点地图', url: '/sitemap.xml' },
]

const { data: listRaw } = await useAsyncData('posts:index', () => queryArticleIndex(), { default: () => [] })
const listSorted = computed(() => orderBy(listRaw.value, ['date'], ['desc']))

function getArticleYear(article: ArticleProps) {
	try {
		return toZonedTemporal(article.date as string).year.toString()
	}
	catch {
		return '未知'
	}
}

const listGrouped = computed(() => Object.entries(groupBy(listSorted.value, getArticleYear)))
</script>

<template>
<template #aside>
	<WidgetBlogStats />
</template>

<BlogHeader class="hide-above-mobile" to="/" suffix="站点地图" tag="h1" />

<div class="sitemap-page">
	<section class="sitemap-intro card">
		<div class="intro-head">
			<div class="intro-icon">
				<Icon name="tabler:sitemap" />
			</div>
			<div class="intro-text">
				<h2 class="text-creative">
					站点地图
				</h2>
				<p>{{ appConfig.title }}的全部页面与文章索引，同时保留标准 XML 供搜索引擎与软件抓取。</p>
			</div>
		</div>

		<Copy prompt="sitemap.xml" :code="sitemapUrl" />

		<div class="intro-actions">
			<ZButton primary to="/sitemap.xml" icon="tabler:file-code" text="查看原始 XML" />
			<ZButton to="/atom.xml" icon="tabler:rss" text="Atom 订阅" />
			<ZButton external to="/subscriptions.opml" icon="tabler:list-details" text="友链订阅" />
		</div>
	</section>

	<section class="sitemap-section">
		<h2 class="section-title">
			<Icon name="tabler:layout-grid" />
			页面
		</h2>

		<menu class="page-grid">
			<UtilLink
				v-for="page in pages"
				:key="page.url"
				class="page-card card upraise"
				:to="page.url"
			>
				<Icon :name="page.icon" />
				<span>{{ page.text }}</span>
			</UtilLink>
		</menu>
	</section>

	<section class="sitemap-section">
		<h2 class="section-title">
			<Icon name="tabler:files" />
			文章
			<span class="count">{{ listSorted.length }}</span>
		</h2>

		<section
			v-for="[year, group] in listGrouped"
			:key="year"
			class="year-group"
		>
			<h3 class="year-title">
				{{ year }}
				<span class="count">{{ group.length }}</span>
			</h3>

			<menu class="year-list">
				<PostArchive
					v-for="article, index in group"
					:key="article.path"
					v-bind="article"
					:to="article.path"
					:style="getFixedDelay(index * 0.02)"
				/>
			</menu>
		</section>
	</section>
</div>
</template>

<style scoped>
.sitemap-page {
	margin: 1rem;
}

.sitemap-intro {
	display: grid;
	gap: 1em;
	padding: 1.5em;

	.intro-head {
		display: flex;
		align-items: flex-start;
		gap: 0.8em;
	}

	.intro-icon {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 3em;
		height: 3em;
		border-radius: 1em;
		background: linear-gradient(135deg, var(--c-primary-soft), var(--c-accent-soft) 65%, transparent);
		font-size: 1.6em;
		color: var(--c-primary);
	}

	.intro-text {
		> h2 {
			margin-bottom: 0.3em;
			font-size: 1.6em;
		}

		> p {
			color: var(--c-text-2);
		}
	}

	.intro-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}
}

.sitemap-section {
	margin-top: 2em;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.3em;
	font-size: 1.3em;

	.count {
		margin-inline-start: 0.2em;
		padding: 0 0.5em;
		border-radius: 1em;
		background-color: var(--c-bg-soft);
		font-size: 0.6em;
		color: var(--c-text-2);
		font-variant-numeric: tabular-nums;
	}
}

.page-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
	gap: 0.5em;
	margin-top: 1em;

	.page-card {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.8em;
		border-radius: 0.5em;
		color: var(--c-text-2);
		transition: color 0.2s;

		&:hover {
			color: var(--c-text);
		}

		> .iconify {
			flex-shrink: 0;
			font-size: 1.4em;
			color: var(--c-primary);
		}

		> span {
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
}

.year-group {
	margin-top: 1.5em;

	.year-title {
		display: flex;
		align-items: center;
		gap: 0.5em;
		opacity: 0.5;
		mask-image: linear-gradient(#FFF 50%, transparent);
		font-family: var(--font-stroke-free);
		font-size: 2.5em;
		font-weight: 800;
		line-height: 1;
		color: transparent;
		-webkit-text-stroke: 1px var(--c-text-3);

		&::selection, :hover > & {
			color: var(--c-text-3);
		}

		.count {
			font-size: 0.4em;
			-webkit-text-stroke: 0;
			color: var(--c-text-3);
		}
	}
}

.year-list {
	margin-top: 0.5em;
}
</style>
