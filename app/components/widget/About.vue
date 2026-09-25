<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
<BlogWidget card title="关于我">
	<div class="profile">
		<img
			class="avatar"
			:src="appConfig.author.avatar"
			:alt="appConfig.author.name"
			width="48"
			height="48"
		>

		<div class="meta">
			<div class="name">
				{{ appConfig.author.name }}
			</div>
			<div class="subtitle">
				{{ appConfig.subtitle }}
			</div>
		</div>
	</div>

	<p class="bio">
		一名学生，开源爱好者，业余时间喜欢自己玩点东西。
	</p>
</BlogWidget>
</template>

<style scoped>
.profile {
	display: flex;
	align-items: center;
	gap: 0.6em;
}

.avatar {
	flex-shrink: 0;
	width: 2.6em;
	height: 2.6em;
	border-radius: 50%;
}

.name {
	font-family: var(--font-creative);
	font-weight: 550;
}

.subtitle {
	font-size: 0.85em;
	color: var(--c-text-3);
}

.bio {
	margin-top: 0.6em;
	color: var(--c-text-2);
}
</style>
