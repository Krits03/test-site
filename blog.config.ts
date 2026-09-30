import type { FeedEntry } from './app/types/feed'

const basicConfig = {
	title: 'Kr.Zhan',
	subtitle: 'KKrr233',
	// 长 description 利好于 SEO
	description: 'wkr的个人博客，分享知识，一名开源爱好者.',
	author: {
		name: 'wkr',
		avatar: 'https://weavatar.com/avatar/66eb9d166e7d453d0cc9a01e460860df84d8b8b5683869607e58fbcf58b32f95?s=160',
		email: 'me@wkr-dev.top',
		homepage: 'https://www.github.com/Krits03',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: 'https://weavatar.com/avatar/66eb9d166e7d453d0cc9a01e460860df84d8b8b5683869607e58fbcf58b32f95?s=160',
	language: 'zh-CN',
	timeEstablished: '2026-03-07',
	timeZone: 'Asia/Shanghai',
	url: 'https://site.wkr-dev.top/',
	defaultCategory: '未分类',
}

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
// @keep-sorted
const blogConfig = {
	...basicConfig,

	article: {
		categories: {
			[basicConfig.defaultCategory]: { icon: 'tabler:circle-dashed' },
			/** 实践可复用操作经验：工具/系统/部署/排障 */
			技术: { icon: 'tabler:mouse', color: '#41b883' },
			/** 编程：代码实现/工程实践/开发方法 */
			开发: { icon: 'tabler:code', color: '#647eff' },
			/** 安全：漏洞/CTF/恶意软件/安全事件分析 */
			安全: { icon: 'tabler:bug', color: '#ff7733' },
			/** 思考：观点讨论/复盘反思/行业或产品观察 */
			杂谈: { icon: 'tabler:message', color: '#33bbaa' },
			/** 记录叙事：个人经历/校园家庭/日常片段 */
			生活: { icon: 'tabler:leaf', color: '#ff7777' },
		},
		/** 文章版式，首个为默认版式 */
		types: {
			tech: {},
			story: {},
		},
		/** 分类排序方式，键为排序字段，值为显示名称 */
		order: {
			date: '创建日期',
			updated: '更新日期',
			// title: '标题',
		},
		/** 使用 pnpm new 新建文章时自动生成自定义链接（permalink/abbrlink） */
		useRandomPremalink: false,
		/** 隐藏基于文件路由（不是自定义链接）的 URL /post 路径前缀 */
		hidePostPrefix: true,
		/** 禁止搜索引擎收录的路径 */
		robotsNotIndex: ['/preview', '/previews/*'],
	},

	/** 博客 Atom 订阅源 */
	feed: {
		/** 订阅源最大文章数量 */
		limit: 50,
		/**
		 * 订阅源是否启用 XSLT 样式（/assets/atom.xsl）
		 * 浏览器正在移除 XSLT，开启时打开 atom.xml 会弹出「functionality is being removed」弃用警告，
		 * 且对订阅器与搜索引擎无影响，故关闭，直接输出纯 XML
		 */
		enableStyle: false,
	},

	/** 向 <head> 中添加脚本 */
	scripts: [
		// Umami 官方云统计（cloud.umami.is）
		// 更新脚本：curl -sL https://cloud.umami.is/script.js -o public/site-res/umami.js
		{ 'src': '/site-res/umami.js', 'data-website-id': 'dce6932a-f94e-4645-8826-bb290a044d40', 'defer': true },
		// 自己网站的 Cloudflare Insights 统计服务
		{ 'src': 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "4ae7cffe5f8246079a0890511f066c21"}', 'defer': true },
		// Cap 人机验证组件的内部依赖：Cap 默认从 cdn.jsdelivr.net 取 wasm 与 pako 解压库，该域名在国内不稳定。
		// 已本地化到 public/site-res/cap/ 同源加载（镜像站不可靠：npmmirror 只在部分边缘节点回 ACAO，zstatic 对 .wasm 直接 451）。
		// wasm 版本需与组件内部写死的版本一致（当前 0.0.8），升级组件时同步更新：
		// curl -sL -o public/site-res/cap/cap_wasm_bg.wasm https://cdn.jsdelivr.net/npm/@cap.js/wasm@0.0.8/browser/cap_wasm_bg.wasm
		// curl -sL -o public/site-res/cap/hashwx.wasm https://cdn.jsdelivr.net/npm/@cap.js/wasm@0.0.8/browser/hashwx.wasm
		// curl -sL -o public/site-res/cap/pako_inflate.min.js https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako_inflate.min.js
		// （Cap 用 fetch().arrayBuffer() + WebAssembly.compile()，不依赖响应 MIME，静态托管无需额外配置）
		{
			innerHTML: 'window.CAP_CUSTOM_WASM_URL="/site-res/cap/cap_wasm_bg.wasm";'
				+ 'window.CAP_CUSTOM_HASHWX_URL="/site-res/cap/hashwx.wasm";'
				+ 'window.CAP_PAKO_URL="/site-res/cap/pako_inflate.min.js";',
		},
		// Twikoo 人机验证组件（Cap widget）
		// 已本地化到 public/site-res/cap/cap.min.js，整条 Cap 链路（组件 + wasm + 解压库）均为同源加载：
		// 且该脚本是 defer：一旦挂起会拖到超时才放行后续脚本与 hydration，评论区会长时间停在「评论加载中...」。
		// 更新（版本需与下面 wasm 的版本一致）：
		// curl -sL -o public/site-res/cap/cap.min.js https://cdn.jsdelivr.net/npm/@cap.js/widget@0.1.58/cap.min.js
		{ src: '/site-res/cap/cap.min.js', defer: true },
		// Twikoo 评论系统
		// 官方 2.x 的语法目标为 ES2022，最低支持 Chrome/Edge 94、Firefox 93、Safari 15.4（更低的浏览器不受支持）
		{ src: 'https://s4.zstatic.net/npm/twikoo@2.0.9/dist/twikoo.min.js', defer: true },
	],

	/** 文章统计配置 */
	stats: {
		/**
		 * 统计范围，匹配 content 下不含扩展名的路径（stem）；空数组统计全部内容
		 * 使用 SQL LIKE 语法：% 匹配任意长度字符，_ 匹配单个字符
		 * 多个范围取并集，如 ['posts/%', 'book/%']
		 */
		includePaths: [] as string[],
	},

	/** 自己部署的 Twikoo 服务 */
	twikoo: {
		envId: 'https://twikoo.site.wkr-dev.top/.netlify/functions/twikoo/',
		preload: 'https://twikoo.site.wkr-dev.top/.netlify/functions/twikoo/',
		/** 评论内代码高亮的 Prism 资源地址：Twikoo 默认写死为 cdn.jsdelivr.net（国内不稳定），改用 zstatic 镜像 */
		prismCdn: 'https://s4.zstatic.net/npm/prismjs@1.28.0',
	},
}

/** 用于生成 OPML 和友链页面配置 */
export const myFeed: FeedEntry = {
	author: blogConfig.author.name,
	sitenick: 'Kr.Zhan',
	title: blogConfig.title,
	desc: blogConfig.subtitle || blogConfig.description,
	link: blogConfig.url,
	feed: new URL('/atom.xml', blogConfig.url).toString(),
	icon: blogConfig.favicon,
	avatar: blogConfig.author.avatar,
	archs: ['Nuxt', 'Vercel'],
	date: blogConfig.timeEstablished,
	comment: 'Coding...',
}

export default blogConfig
