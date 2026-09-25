declare global {
	interface Window {
		twikoo?: {
			init: (options: {
				envId: string
				el: string
				region?: string
				path?: string
				lang?: string
				/** 评论内代码高亮的 Prism 资源地址 */
				prismCdn?: string
			}) => void
			version: string
		}
	}
}
