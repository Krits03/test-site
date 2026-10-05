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

/** NCM（NeteaseCloudMusicApi）在线数据源，用于按歌单 ID 解析网易云曲目 */
export interface MusicNcmSource {
	/** 实例根地址，如 'https://music-163.api.kr033.top' */
	api: string
	/** 歌单 ID，取自歌单链接的 `id` 查询参数 */
	playlistId: string
	/**
	 * 是否启用 randomCNIP（随机中国出口 IP），绕过网易云对数据中心 IP 的直链风控。
	 * 默认 true；官方 API 复刻版支持该参数，无需改动即可保持开启。
	 */
	randomCNIP?: boolean
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
	/**
	 * 在线音源选择：
	 * - 'meting' 走 Meting 接口（按平台聚合，支持网易云 / QQ / 酷狗等）
	 * - 'ncm'    走 NeteaseCloudMusicApi 接口（官方 API 复刻，可自托管）
	 * 本地 playlist 始终优先于以上二者。
	 */
	source: 'meting' | 'ncm'
	/** 在线歌单（Meting）：source 设为 'meting' 时生效 */
	meting: MusicMetingSource
	/** 在线音源（NCM）：source 设为 'ncm' 时生效 */
	ncm: MusicNcmSource
	/** 本地歌单：非空时优先于以上所有在线音源 */
	playlist: MusicItem[]
	/** 音源加载失败时的提示文案 */
	errorTip: string
}

// 默认音量设置
const musicConfig: MusicConfig = {
	enable: true,
	defaultVolume: 0.6,
	defaultMode: 'list',
	showVolume: true,

	// 在线音源开关：'meting' 或 'ncm'；本地 playlist 始终优先
	source: 'ncm',

	/**
	 * 在线歌单（Meting）
	 * 填写 api 与 playlistId 即可使用；二者留空则回落到下方本地歌单。
	 * 例：
	 *   api: 'https://meting.api.zkz098.cn/',
	 *   server: 'netease',
	 *   playlistId: '12834717281',
	 */
	meting: {
		// Meting API 实例（kr033.top 自托管，基于 zkz098/meting-api-rs 同源实现）
		// legacy 接口：GET /api?server=netease&type=playlist&id=...
		// 实测：无出口限制，裸 type=url 默认 302 跳真实网易云 mp3，可直接播放；
		//       返回字段为 title/author（非 name/artist），已在 app/stores/music.ts 兼容。
		api: 'https://meting.api.kr033.top/api',
		server: 'netease',
		// 歌单「栈点 Krits03」：https://music.163.com/m/playlist?id=18440555172
		// 注：网易云下架/灰掉的曲目不会被返回，当前可用 1 首
		playlistId: '18440555172',
	},

	/**
	 * 在线音源（NCM / NeteaseCloudMusicApi 增强版）
	 * source 设为 'ncm' 时启用。基于网易云官方 API 复刻，可自托管，便于后续自行维护。
	 * 接口链路：
	 *   /playlist/detail?id=...            → 歌单曲目列表（name / ar / al.picUrl）
	 *   /song/url?id=...&randomCNIP=true   → 批量播放直链（绕过直链风控，320k mp3）
	 *   /lyric?id=...                      → 歌词文本（并行拉取，失败不致命）
	 * 实测：CORS: *，randomCNIP 可用，返回真实 mp3 直链。
	 */
	ncm: {
		api: 'https://music-163.api.kr033.top',
		playlistId: '18440555172',
		// 随机中国出口 IP，绕过网易云对数据中心 IP 的直链风控；无需改动可保持开启
		randomCNIP: true,
	},

	/**
	 * 本地歌单
	 * 填入后优先于 Meting 与 NCM，适合把音频放进 public/ 自托管，避免依赖第三方服务。
	 * 例：
	 *   {
	 *     name: '示例歌曲',
	 *     artist: '示例歌手',
	 *     url: '/music/demo.mp3',
	 *     cover: '/music/demo.avif',
	 *   },
	 */
	playlist: [],

	errorTip: '音频加载失败，可能是版权限制或跨域问题',
}

export default musicConfig
