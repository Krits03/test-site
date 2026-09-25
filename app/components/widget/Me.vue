<script setup lang="ts">
import type { NavItem } from '~/types/nav'

const appConfig = useAppConfig()

const contactList: NavItem[] = [
	{ icon: 'tabler:brand-github', text: 'GitHub', url: appConfig.author.homepage },
	{ icon: 'tabler:mail', text: appConfig.author.email, url: `mailto:${appConfig.author.email}` },
	{ icon: 'tabler:router', text: '站点状态', url: 'https://status.wkr-dev.top/' },
	{ icon: 'tabler:rss', text: 'Atom 订阅', url: '/atom.xml' },
]
</script>

<template>
<BlogWidget card title="找到我">
	<ul class="contact-list">
		<li v-for="{ icon, text, url } in contactList" :key="text">
			<UtilLink :to="url" :title="text">
				<Icon :name="icon" />
				<span class="text">{{ text }}</span>
			</UtilLink>
		</li>
	</ul>
</BlogWidget>
</template>

<style scoped>
.contact-list {
	display: grid;
	gap: 0.15em;
}

a {
	display: flex;
	align-items: center;
	gap: 0.5em;
	padding: 0.25em 0.4em;
	border-radius: 0.5em;
	transition: background-color 0.2s, color 0.2s;

	&:hover {
		background-color: var(--c-bg-soft);
		color: var(--c-primary);
	}

	.iconify {
		flex-shrink: 0;
	}

	.text {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
}
</style>
