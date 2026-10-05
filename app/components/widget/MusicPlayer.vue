<script setup lang="ts">
import musicConfig from '~~/music.config'

const store = useMusicStore()

// 音乐卡片默认折叠，点击标题右侧按钮可展开；偏好记忆在 localStorage
const COLLAPSE_KEY = 'music-card-collapsed'
const collapsed = ref(true)
function toggleCollapse() {
	collapsed.value = !collapsed.value
	if (import.meta.client)
		localStorage.setItem(COLLAPSE_KEY, collapsed.value ? '1' : '0')
}

// 拖动进度条期间用本地值渲染，避免被 timeupdate 抢回
const seeking = ref(false)
const seekValue = ref(0)

const shownTime = computed(() => seeking.value ? seekValue.value : store.currentTime)
const shownPercent = computed(() => store.duration > 0 ? (shownTime.value / store.duration) * 100 : 0)
const volumePercent = computed(() => Math.min(100, Math.max(0, store.volume * 100)) || 0)

const modeMeta = computed(() => ({
	list: { icon: 'tabler:repeat', tip: '列表循环' },
	one: { icon: 'tabler:repeat-once', tip: '单曲循环' },
	random: { icon: 'tabler:arrows-shuffle', tip: '随机播放' },
})[store.mode] ?? { icon: 'tabler:repeat', tip: '列表循环' })

const volumeIcon = computed(() => {
	if (store.muted || store.volume <= 0)
		return 'tabler:volume-off'
	if (store.volume < 0.34)
		return 'tabler:volume'
	if (store.volume < 0.67)
		return 'tabler:volume-2'
	return 'tabler:volume-3'
})

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds <= 0)
		return '0:00'

	const total = Math.floor(seconds)
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function onSeekInput(event: Event) {
	seeking.value = true
	seekValue.value = Number((event.target as HTMLInputElement).value)
}

function onSeekCommit() {
	store.seek(seekValue.value)
	seeking.value = false
}

onMounted(() => {
	if (import.meta.client) {
		const saved = localStorage.getItem(COLLAPSE_KEY)
		if (saved !== null)
			collapsed.value = saved === '1'
	}
	store.init()
})
</script>

<template>
<BlogWidget card title="音乐">
	<template #action>
		<button
			class="collapse-toggle"
			type="button"
			:title="collapsed ? '展开音乐播放器' : '收起音乐播放器'"
			:aria-label="collapsed ? '展开音乐播放器' : '收起音乐播放器'"
			:aria-expanded="!collapsed"
			@click="toggleCollapse()"
		>
			<Icon :name="collapsed ? 'tabler:chevrons-down' : 'tabler:chevrons-up'" />
		</button>
	</template>

	<div v-show="!collapsed">
		<p v-if="!musicConfig.enable" class="player-tip">
			播放器已在 music.config.ts 中关闭
		</p>

	<ClientOnly v-else>
		<div v-if="store.error" class="player-error">
			<p class="player-tip" title="请检查 music.config.ts 中的歌单配置">
				{{ store.error }}
			</p>
			<button
				class="retry"
				type="button"
				:disabled="store.retrying"
				title="重新加载歌单"
				aria-label="重新加载歌单"
				@click="store.retry()"
			>
				<Icon
					:name="store.retrying ? 'tabler:loader-2' : 'tabler:refresh'"
					:class="{ spin: store.retrying }"
				/>
				<span>{{ store.retrying ? '重试中…' : '重新加载' }}</span>
			</button>
		</div>

		<p v-else-if="store.loading && !store.ready" class="player-tip">
			歌单加载中…
		</p>

		<div v-else class="player">
			<div class="track">
				<div class="disc" :class="{ spinning: store.playing }">
					<img
						v-if="store.current?.cover"
						class="disc-cover"
						:src="store.current.cover"
						alt=""
						loading="lazy"
						referrerpolicy="no-referrer"
					>
					<Icon v-else class="disc-fallback" name="tabler:music" />
				</div>

				<div class="meta">
					<p class="name" :title="store.current?.name">
						{{ store.current?.name ?? '未选择歌曲' }}
					</p>
					<p class="artist" :title="store.current?.artist">
						{{ store.current?.artist || '—' }}
					</p>
				</div>
			</div>

			<p v-if="store.playError" class="player-tip">
				{{ store.playError }}
			</p>

			<label class="seek">
				<input
					type="range"
					min="0"
					:max="store.duration || 0"
					step="0.1"
					:value="shownTime"
					:style="{ '--progress': `${shownPercent}%` }"
					aria-label="播放进度"
					@input="onSeekInput"
					@change="onSeekCommit"
				>
				<span class="time">
					{{ formatTime(shownTime) }} / {{ formatTime(store.duration) }}
				</span>
			</label>

			<div class="controls">
				<button class="ctrl" type="button" title="上一首" aria-label="上一首" @click="store.prev()">
					<Icon name="tabler:player-skip-back" />
				</button>

				<button
					class="ctrl play"
					type="button"
					:title="store.playing ? '暂停' : '播放'"
					:aria-label="store.playing ? '暂停' : '播放'"
					@click="store.toggle()"
				>
					<Icon :name="store.playing ? 'tabler:player-pause' : 'tabler:player-play'" />
				</button>

				<button class="ctrl" type="button" title="下一首" aria-label="下一首" @click="store.next()">
					<Icon name="tabler:player-skip-forward" />
				</button>

				<button
					class="ctrl"
					:class="{ active: store.mode !== 'list' }"
					type="button"
					:title="modeMeta.tip"
					:aria-label="modeMeta.tip"
					@click="store.cycleMode()"
				>
					<Icon :name="modeMeta.icon" />
				</button>

				<button
					class="ctrl"
					:class="{ active: store.expanded }"
					type="button"
					title="播放列表"
					aria-label="播放列表"
					:aria-expanded="store.expanded"
					@click="store.toggleList()"
				>
					<Icon name="tabler:playlist" />
				</button>
			</div>

			<div v-if="musicConfig.showVolume" class="volume">
				<button
					class="ctrl"
					type="button"
					:title="store.muted ? '取消静音' : '静音'"
					:aria-label="store.muted ? '取消静音' : '静音'"
					@click="store.toggleMute()"
				>
					<Icon :name="volumeIcon" />
				</button>
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					:value="store.volume"
					:style="{ '--progress': `${volumePercent}%` }"
					aria-label="音量"
					@input="store.setVolume(Number(($event.target as HTMLInputElement).value))"
				>
			</div>

			<Transition name="playlist">
				<ul v-if="store.expanded" class="playlist scrollcheck-y">
					<li v-for="(item, i) in store.list" :key="`${i}-${item.url}`">
						<button
							type="button"
							:class="{ active: i === store.index }"
							:title="item.name"
							@click="store.go(i)"
						>
							<span class="item-name">{{ item.name }}</span>
							<span class="item-artist">{{ item.artist }}</span>
						</button>
					</li>
				</ul>
			</Transition>
		</div>

		<template #fallback>
			<p class="player-tip">
				播放器加载中…
			</p>
		</template>
	</ClientOnly>
	</div>
</BlogWidget>
</template>

<style scoped>
.player-tip {
	padding: 0.6em 0.2em;
	font-size: 0.9em;
	text-align: center;
	color: var(--c-text-2);
}

.collapse-toggle {
	display: grid;
	place-items: center;
	width: 1.6rem;
	height: 1.6rem;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: none;
	font-size: 1.1rem;
	color: var(--c-text-2);
	transition: background-color 0.2s, color 0.2s;
	cursor: pointer;

	&:hover {
		background-color: var(--c-bg-soft);
		color: var(--c-primary);
	}
}

.player-error {
	display: grid;
	justify-items: center;
	gap: 0.5rem;
}

.retry {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.4rem 0.9rem;
	border: 1px solid var(--c-border);
	border-radius: 1rem;
	background-color: var(--c-primary-soft);
	color: var(--c-primary);
	font-size: 0.85em;
	transition: background-color 0.2s, color 0.2s, opacity 0.2s;
	cursor: pointer;

	&:hover:not(:disabled) {
		background-color: var(--c-primary);
		color: var(--c-bg);
	}

	&:disabled {
		opacity: 0.65;
		cursor: progress;
	}

	.spin {
		animation: retry-spin 1s linear infinite;
	}
}

@keyframes retry-spin {
	to { transform: rotate(1turn); }
}

.player {
	display: grid;
	gap: 0.6rem;
}

.track {
	display: flex;
	align-items: center;
	gap: 0.6rem;
	min-width: 0;
}

.disc {
	display: grid;
	flex-shrink: 0;
	place-items: center;
	position: relative;
	overflow: hidden;
	width: 3.4rem;
	height: 3.4rem;
	border-radius: 50%;
	box-shadow: var(--box-shadow-1);
	background-color: var(--c-bg-3);

	&::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px var(--c-border);
		background-color: var(--c-bg-2);
		transform: translate(-50%, -50%);
	}
}

.disc-cover {
	width: 100%;
	height: 100%;
	animation: disc-spin 16s linear infinite;
	animation-play-state: paused;
	object-fit: cover;

	.disc.spinning & {
		animation-play-state: running;
	}
}

.disc-fallback {
	font-size: 1.4rem;
	color: var(--c-text-2);
}

@keyframes disc-spin {
	to { transform: rotate(1turn); }
}

.meta {
	min-width: 0;

	.name {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--c-text);
	}

	.artist {
		overflow: hidden;
		font-size: 0.85em;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--c-text-2);
	}
}

.seek,
.volume {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	min-width: 0;
}

.seek {
	flex-direction: column;
	gap: 0.25rem;

	.time {
		align-self: flex-end;
		font-size: 0.75em;
		color: var(--c-text-2);
		font-variant-numeric: tabular-nums;
	}
}

.volume {
	padding-inline-start: 0.1rem;
}

/* 进度条与音量条统一走主题主色，明暗模式自动跟随 */
.seek input[type="range"],
.volume input[type="range"] {
	flex-grow: 1;
	width: 100%;
	height: 0.35rem;
	border-radius: 1rem;
	outline: none;
	background: linear-gradient(to right, var(--c-primary) var(--progress, 0%), var(--c-bg-soft) var(--progress, 0%));
	appearance: none;
	cursor: pointer;
}

.seek input[type="range"]::-webkit-slider-thumb,
.volume input[type="range"]::-webkit-slider-thumb {
	width: 0.7rem;
	height: 0.7rem;
	border: none;
	border-radius: 50%;
	background-color: var(--c-primary);
	transition: transform 0.2s;
	appearance: none;
}

.seek input[type="range"]:hover::-webkit-slider-thumb,
.seek input[type="range"]:focus-visible::-webkit-slider-thumb,
.volume input[type="range"]:hover::-webkit-slider-thumb,
.volume input[type="range"]:focus-visible::-webkit-slider-thumb {
	transform: scale(1.25);
}

.seek input[type="range"]::-moz-range-thumb,
.volume input[type="range"]::-moz-range-thumb {
	width: 0.7rem;
	height: 0.7rem;
	border: none;
	border-radius: 50%;
	background-color: var(--c-primary);
}

.controls {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.15rem;
}

.ctrl {
	display: grid;
	place-items: center;
	width: 1.9rem;
	height: 1.9rem;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: none;
	font-size: 1.05rem;
	color: var(--c-text-2);
	transition: background-color 0.2s, color 0.2s;
	cursor: pointer;

	&:hover {
		background-color: var(--c-bg-soft);
		color: var(--c-primary);
	}

	&.active {
		background-color: var(--c-primary-soft);
		color: var(--c-primary);
	}
}

.ctrl.play {
	width: 2.4rem;
	height: 2.4rem;
	background-color: var(--c-primary-soft);
	font-size: 1.3rem;
	color: var(--c-primary);

	&:hover {
		background-color: var(--c-primary);
		color: var(--c-bg);
	}
}

.volume .ctrl {
	width: 1.6rem;
	height: 1.6rem;
	font-size: 1rem;
}

.playlist {
	max-height: 9rem;
	padding-inline-end: 0.2rem;
	overscroll-behavior: contain;

	button {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		width: 100%;
		padding: 0.25rem 0.4rem;
		border: none;
		border-radius: 0.4rem;
		background: none;
		text-align: start;
		color: var(--c-text-2);
		transition: background-color 0.2s, color 0.2s;
		cursor: pointer;

		&:hover {
			background-color: var(--c-bg-soft);
			color: var(--c-text);
		}

		&.active {
			color: var(--c-primary);

			.item-name::before {
				content: "";
				display: inline-block;
				width: 0.4em;
				height: 0.4em;
				margin-inline-end: 0.3em;
				border-radius: 50%;
				background-color: currentcolor;
				vertical-align: middle;
			}
		}
	}

	.item-name {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.item-artist {
		flex-shrink: 0;
		margin-inline-start: auto;
		font-size: 0.8em;
		color: var(--c-text-2);
	}
}

.playlist-enter-active,
.playlist-leave-active {
	transition: opacity 0.2s, translate 0.2s;
}

.playlist-enter-from,
.playlist-leave-to {
	opacity: 0;
	translate: 0 -0.3rem;
}

@media (prefers-reduced-motion: reduce) {
	.disc-cover {
		animation: none;
	}
}
</style>
