import type { MusicItem, MusicPlayMode } from '~~/music.config'
import musicConfig from '~~/music.config'

/**
 * 模块级单例 audio：跨路由与组件实例共享同一个播放器，
 * 侧栏在首页与文章页之间切换时不会中断播放，也不会出现多个音频同时播放。
 */
let audio: HTMLAudioElement | null = null
let bound = false

function getAudio(): HTMLAudioElement | null {
	if (!import.meta.client)
		return null

	audio ??= new Audio()
	return audio
}

/** Meting 歌单接口返回的单首曲目 */
interface MetingItem {
	name: string
	artist?: string
	url?: string | null
	pic?: string
	lrc?: string
}

const PLAY_MODES: MusicPlayMode[] = ['list', 'one', 'random']

function clamp01(value: number) {
	if (!Number.isFinite(value))
		return 0
	return Math.min(1, Math.max(0, value))
}

export const useMusicStore = defineStore('music', () => {
	const list = ref<MusicItem[]>([])
	const index = ref(0)
	const playing = ref(false)
	const loading = ref(false)
	const error = ref('')
	/** 单曲加载/播放失败，仅作行内提示，不影响播放器继续使用 */
	const playError = ref('')
	/** 歌单是否已成功加载 */
	const ready = ref(false)
	/** 播放列表面板是否展开 */
	const expanded = ref(false)

	const currentTime = ref(0)
	const duration = ref(0)
	const muted = ref(false)

	// 音量与播放模式按浏览器记忆，避免每次进站都要重设
	const volume = useLocalStorage('music:volume', musicConfig.defaultVolume)
	const mode = useLocalStorage<MusicPlayMode>('music:mode', musicConfig.defaultMode)

	// 兼容本地存储中的历史/非法值
	if (!PLAY_MODES.includes(mode.value))
		mode.value = musicConfig.defaultMode

	const current = computed(() => list.value[index.value])

	/** 读取歌单：本地歌单优先，其次 Meting，都没有则返回空 */
	async function resolvePlaylist(): Promise<MusicItem[]> {
		if (musicConfig.playlist.length)
			return [...musicConfig.playlist]

		const { api, server, playlistId } = musicConfig.meting
		if (!api || !playlistId)
			return []

		const url = new URL(api)
		url.searchParams.set('server', server)
		url.searchParams.set('type', 'playlist')
		url.searchParams.set('id', playlistId)

		const res = await fetch(url)
		if (!res.ok)
			throw new Error(`歌单请求失败：HTTP ${res.status}`)

		const data = await res.json() as MetingItem[]
		return data.flatMap((item) => {
			if (!item.url)
				return []

			return [{
				name: item.name,
				artist: item.artist,
				url: item.url,
				cover: item.pic,
				lrc: item.lrc,
			}]
		})
	}

	/** 绑定播放器事件，只执行一次 */
	function bind() {
		const el = getAudio()
		if (!el || bound)
			return
		bound = true

		el.volume = muted.value ? 0 : clamp01(volume.value)

		el.addEventListener('timeupdate', () => currentTime.value = el.currentTime)
		el.addEventListener('durationchange', () => duration.value = Number.isFinite(el.duration) ? el.duration : 0)
		el.addEventListener('play', () => playing.value = true)
		el.addEventListener('pause', () => playing.value = false)
		el.addEventListener('waiting', () => loading.value = true)
		el.addEventListener('canplay', () => loading.value = false)
		el.addEventListener('playing', () => loading.value = false)
		el.addEventListener('ended', onEnded)
		el.addEventListener('error', () => {
			playing.value = false
			loading.value = false
			playError.value = musicConfig.errorTip
		})
	}

	function applySource(i: number) {
		const el = getAudio()
		const item = list.value[i]
		if (!el || !item)
			return

		el.src = item.url
		currentTime.value = 0
		duration.value = 0
		playError.value = ''
	}

	async function play() {
		const el = getAudio()
		if (!el || !list.value.length)
			return

		if (!el.src)
			applySource(index.value)

		try {
			await el.play()
		}
		catch {
			// 多为浏览器自动播放策略拦截；用户手动点击后即可恢复
			playError.value = '播放被浏览器拦截，请再次点击播放'
		}
	}

	function pause() {
		getAudio()?.pause()
	}

	function toggle() {
		if (playing.value)
			pause()
		else
			void play()
	}

	/** 切到指定曲目，autoPlay 控制是否立即播放 */
	function go(i: number, autoPlay = true) {
		const total = list.value.length
		if (!total)
			return

		index.value = (i % total + total) % total
		applySource(index.value)
		if (autoPlay)
			void play()
	}

	/** 随机模式下避免连续抽到同一首 */
	function randomIndex() {
		const total = list.value.length
		if (total <= 1)
			return index.value

		let next = index.value
		while (next === index.value)
			next = Math.floor(Math.random() * total)
		return next
	}

	function next() {
		go(mode.value === 'random' ? randomIndex() : index.value + 1)
	}

	function prev() {
		const el = getAudio()
		// 播放超过 3 秒时先回到开头，符合常见播放器习惯
		if (el && el.currentTime > 3) {
			seek(0)
			return
		}
		go(index.value - 1)
	}

	function onEnded() {
		if (mode.value === 'one') {
			const el = getAudio()
			if (el) {
				el.currentTime = 0
				void el.play()
			}
			return
		}
		next()
	}

	function seek(time: number) {
		const el = getAudio()
		if (!el || !Number.isFinite(time))
			return

		el.currentTime = time
		currentTime.value = time
	}

	function setVolume(v: number) {
		const next = clamp01(v)
		volume.value = next
		if (next > 0)
			muted.value = false

		const el = getAudio()
		if (el)
			el.volume = muted.value ? 0 : next
	}

	function toggleMute() {
		muted.value = !muted.value
		const el = getAudio()
		if (el)
			el.volume = muted.value ? 0 : clamp01(volume.value)
	}

	function cycleMode() {
		mode.value = PLAY_MODES[(PLAY_MODES.indexOf(mode.value) + 1) % PLAY_MODES.length]
	}

	function toggleList() {
		expanded.value = !expanded.value
	}

	/** 首次挂载时加载歌单并绑定事件；重复调用直接跳过 */
	let initializing = false
	async function init() {
		if (!musicConfig.enable || ready.value || initializing)
			return

		initializing = true
		loading.value = true
		try {
			bind()
			const items = await resolvePlaylist()
			list.value = items

			if (!items.length) {
				error.value = '尚未配置歌单'
				return
			}

			ready.value = true
			applySource(0)
		}
		catch (e) {
			error.value = e instanceof Error ? e.message : '歌单加载失败'
		}
		finally {
			loading.value = false
			initializing = false
		}
	}

	return {
		list,
		index,
		playing,
		loading,
		error,
		playError,
		ready,
		expanded,
		currentTime,
		duration,
		muted,
		volume,
		mode,
		current,
		init,
		play,
		pause,
		toggle,
		go,
		next,
		prev,
		seek,
		setVolume,
		toggleMute,
		cycleMode,
		toggleList,
	}
})
