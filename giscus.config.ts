/**
 * giscus 评论系统独立配置
 *
 * giscus 基于 GitHub Discussions 存储评论，官方配置生成器：https://giscus.app/zh-CN
 * 使用前请先：
 *   1. 在 GitHub 仓库（如 Krits03/blog）Settings → General → Features 中开启 Discussions；
 *   2. 为仓库安装 giscus App：https://github.com/apps/giscus；
 *   3. 打开配置生成器，仓库填入下方 repo，选择 Discussion 分类后，
 *      把生成器给出的 repoId、category、categoryId 原样复制到本文件即可。
 *
 * 本文件被 app/app.config.ts 引用，最终通过 useAppConfig().comment.giscus 读取，
 * 因此无需改动组件代码即可完成配置。
 */
export interface GiscusConfig {
	/** giscus 客户端脚本地址，国内可换成自建/镜像地址，如 '/giscus/client.js' */
	src: string
	/** GitHub 仓库，格式 `owner/repo` */
	repo: `${string}/${string}`
	/** 仓库 ID（生成器中的 data-repo-id） */
	repoId: string
	/** Discussion 分类名 */
	category: string
	/** 分类 ID（生成器中的 data-category-id） */
	categoryId: string
	/**
	 * 页面与 Discussion 的映射方式
	 * pathname 最稳妥；title / og:title 需页面标题稳定；specific / number 需配合 term
	 */
	mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
	/** mapping 为 specific（自定义术语）或 number（Discussion 编号）时必填 */
	term?: string
	/** 严格匹配 Discussion 标题 */
	strict: boolean
	/** 启用主贴表情回应 */
	reactionsEnabled: boolean
	/** 向页面输出 Discussion 元数据（如需自行做主题定制可开启） */
	emitMetadata: boolean
	/** 评论输入框位置 */
	inputPosition: 'top' | 'bottom'
	/** 界面语言，如 'zh-CN'、'en' */
	lang: string
	/** iframe 加载方式 */
	loading: 'lazy' | 'eager'
	/** 浅色模式下使用的 giscus 主题（可为内置主题名或自定义 CSS 地址） */
	lightTheme: string
	/** 深色模式下使用的 giscus 主题（可为内置主题名或自定义 CSS 地址） */
	darkTheme: string
}

const giscusConfig: GiscusConfig = {
	src: 'https://giscus.app/client.js',
	repo: 'Krits03/GiscusComment',
	repoId: 'R_kgDOUqpN-A',
	category: 'Announcements',
	categoryId: 'DIC_kwDOUqpN-M4DGWdb',
	mapping: 'pathname',
	strict: false,
	reactionsEnabled: true,
	emitMetadata: true,
	inputPosition: 'top',
	lang: 'zh-CN',
	loading: 'lazy',
	lightTheme: 'light',
	darkTheme: 'dark',
}

export default giscusConfig
