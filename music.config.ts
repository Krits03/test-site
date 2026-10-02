/**
 * 侧边栏音乐播放器独立配置
 *
 * 本文件仅供 `app/components/widget/MusicPlayer.vue` 与 `app/stores/music.ts` 读取，
 * 不接入 blog.config.ts / app.config.ts，直接改这里即可生效，无需改动组件代码。
 * 音频播放跑在浏览器端，因此所有地址都必须是可被访客直接访问的公开资源。
 */

/** 单曲信息 */
export interface MusicItem {
	/** 歌曲名 */
	name: string
	/** 歌手，多个歌手的原始写法由数据源决定 */
	artist?: string
	/** 音频直链（mp3 / m4a / flac 等），需支持 Range 请求以便拖动进度 */
	url: string
	/** 封面图地址 */
	cover?: string
	/** 歌词：LRC 文本，或指向 .lrc 的地址（预留字段，当前仅做数据透传） */
	lrc?: string
}

/** 播放模式：列表循环 / 单曲循环 / 随机播放 */
export type MusicPlayMode = 'list' | 'one' | 'random'

/** Meting 在线数据源，用于按歌单 ID 解析各平台曲目 */
export interface MusicMetingSource {
	/** Meting API 地址，如 'https://meting.api.zkz098.cn/' */
	api: string
	/**
	 * 音源平台，可选值由所用 Meting 服务决定：
	 * netease（网易云）、tencent（QQ音乐）、kugou、kuwo、baidu 等
	 */
	server: string
	/** 歌单 ID，取自歌单链接的 `id` 查询参数 */
	playlistId: string
}

export interface MusicConfig {
	/** 是否在侧边栏展示播放器 */
	enable: boolean
	/** 默认音量 0 ~ 1（首次访问生效，之后跟随浏览器本地记忆） */
	defaultVolume: number
	/** 默认播放模式（首次访问生效，之后跟随浏览器本地记忆） */
	defaultMode: MusicPlayMode
	/** 是否显示音量控制条 */
	showVolume: boolean
	/** 在线歌单：api 与 playlistId 同时填写后才生效 */
	meting: MusicMetingSource
	/** 本地歌单：非空时优先于 meting 配置 */
	playlist: MusicItem[]
	/** 音源加载失败时的提示文案 */
	errorTip: string
}

const musicConfig: MusicConfig = {
	enable: true,
	defaultVolume: 0.8,
	defaultMode: 'list',
	showVolume: true,

	/**
	 * 在线歌单（Meting）
	 * 填写 api 与 playlistId 即可使用；二者留空则回落到下方本地歌单。
	 * 例：
	 *   api: 'https://meting.api.zkz098.cn/',
	 *   server: 'netease',
	 *   playlistId: '12834717281',
	 */
	meting: {
		api: '',
		server: 'netease',
		playlistId: '',
	},

	/**
	 * 本地歌单
	 * 填入后优先于 Meting，适合把音频放进 public/ 自托管，避免依赖第三方服务。
	 * 例：
	 *   {
	 *     name: '示例歌曲',
	 *     artist: '示例歌手',
	 *     url: '/music/demo.mp3',
	 *     cover: '/music/demo.avif',
	 *   },
	 */
	playlist: [
		{
			name: '演示曲目 一',
			artist: '示例歌手',
			url: 'https://cdn.jsdelivr.net/gh/anars/blank-audio@master/1-second-of-silence.mp3',
			cover: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%237c8cff"/%3E%3Ccircle cx="60" cy="60" r="34" fill="%23ffffff" opacity="0.35"/%3E%3C/svg%3E',
		},
		{
			name: '演示曲目 二',
			artist: '示例歌手',
			url: 'https://cdn.jsdelivr.net/gh/anars/blank-audio@master/2-seconds-of-silence.mp3',
			cover: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%234ec9a1"/%3E%3Ccircle cx="60" cy="60" r="34" fill="%23ffffff" opacity="0.35"/%3E%3C/svg%3E',
		},
		{
			name: '演示曲目 三',
			artist: '示例歌手',
			url: 'https://cdn.jsdelivr.net/gh/anars/blank-audio@master/3-seconds-of-silence.mp3',
			cover: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%23e8a33d"/%3E%3Ccircle cx="60" cy="60" r="34" fill="%23ffffff" opacity="0.35"/%3E%3C/svg%3E',
		},
	],

	errorTip: '音频加载失败，可能是版权限制或跨域问题',
}

export default musicConfig
