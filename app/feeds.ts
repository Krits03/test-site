import type { FeedGroup } from '../app/types/feed'
// 友链检测 CLI 需要使用显式导入和相对路径
import { myFeed } from '../blog.config'
// eslint-disable-next-line unused-imports/no-unused-imports
import { getFavicon, getGithubAvatar, getGithubIcon, getOciqGroupAvatar, getOicqAvatar, OicqAvatarSize } from './utils/img'

export default [
	// #region Clarity
	{
		name: 'Clarity',
		desc: '主题作者。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			myFeed,
			{
				author: '纸鹿本鹿',
				sitenick: '纸鹿摸鱼处',
				title: '纸鹿摸鱼处',
				desc: '纸鹿至麓不知路，支炉制露不止漉',
				link: 'https://blog.zhilu.site/',
				feed: 'https://blog.zhilu.site/atom.xml',
				icon: 'https://www.zhilu.site/api/avatar.png',
				avatar: 'https://weavatar.com/avatar/47c0f2e82b76d9b10eb3023df9e02e4e3fdbeaf5b74b842063f207971e7fbe7b?s=160',
				archs: ['Nuxt', 'Astro', 'Vercel'],
				date: '2026-06-06',
				comment: '主题框架作者，开发，技术，生活，杂谈',
			},
		],
	},
	// #endregion
	// #region 网上邻居 since 2026
	{
		name: '网上邻居',
		desc: '哔哔~~通讯中，欢迎常来串门。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: 'Yulliil',
				desc: '今日はうまく笑えたかな？',
				link: 'https://yulliil.moe/blog/',
				feed: 'https://yulliil.moe/blog/',
				icon: 'https://yulliil.moe/blog/assets/logo.svg',
				avatar: 'https://yulliil.moe/blog/assets/yulliil.jpg',
				archs: ['Vue', '国内 CDN'],
				date: '2026-08-28',
				comment: '~♡',
			},
			{
				author: '雨后初晴社',
				desc: '雨中，听雨声轻灵。雨后，赏水木清华。聆听这广阔天地，感受那动人瞬间。',
				link: 'https://www.rainafter.cn',
				feed: 'https://www.rainafter.cn/friends/',
				icon: 'https://image.rainafter.cn/i/2025/03/08/67cbf3ae27bed.jpg',
				avatar: 'https://image.rainafter.cn/i/2025/03/08/67cbf3ae27bed.jpg',
				archs: ['分享', '技术'],
				date: '2026-09-25',
				comment: '技术参考，借鉴',
			},
		],
	},
	// #endregion
] satisfies FeedGroup[]
