---
title: 站点双评论系统简记
description: 从单点 Twikoo 到 Twikoo + giscus 双评论系统
date: 2026-09-25 21:55:00
updated: 2026-09-25 21:55:00
image: https://vercel-blob.api.kr033.top/api/download/post/twikoo+giscus/20260925/1790346624916-1790346541029.jpg
categories: [技术]
aside: [toc]
tags: [Twikoo, giscus, 评论系统, Nuxt, Vue]
---

本站评论区最早只挂了一个 Twikoo，自建自维护，数据放 MongoDB 里。Twikoo也是一坨，于是有双评论系统——Twikoo 和 giscus 的想法，写篇小文记下。

## 为什么上双系统

最初选 Twikoo 纯粹是主题自带，开箱即用、有管理面板、还能匿名评论。勉强还行，很久之前用过Giscus，印象深刻：

```ts [blog.config.ts]
export default {
  twikoo: {
    envId: 'https://xxx.xxxxx.xxx/',
  },
}
```

::card-list
- **默认 Twikoo**：匿名就能评，管理面板也顺，照顾不想登录的访客
- **可切到 giscus**：基于 GitHub Discussions，GitHub 账号直接评、能收回复通知，开发者用着顺手
- **互为兜底**：一个挂了，切到另一个评论区照样能用
::

相关链接：

::link-card
---
title: Twikoo
description: 简洁的静态网站评论系统，自托管、数据存 MongoDB
icon: https://twikoo.js.org/twikoo-logo-mini.png
link: https://twikoo.js.org/
class: gradient-card active
---
::

::link-card
---
title: giscus
description: 基于 GitHub Discussions 的评论系统，评论存进仓库
icon: https://giscus.app/apple-touch-icon.png
link: https://giscus.app/
class: gradient-card active
---
::

## 切换是怎么做的

核心是一组切换按钮，配合 `useLocalStorage` 记住选的是哪个：

```ts [Comment.vue]
const switchItems = [
  { value: 'twikoo', label: 'Twikoo', icon: 'tabler:message-dots' },
  { value: 'giscus', label: 'Giscus', icon: 'simple-icons:github' },
]
```

几个小细节，都是踩出来的：

- 选择记忆放在 `localStorage`，`initOnMounted: true` 挂载之后再读，否则服务端和客户端首屏水合会对不上。
- 切换用 `v-show` 保活而不是 `v-if` 销毁重建——不然每切一次就重新拉一遍评论。
- 懒加载：`activate()` 只在某个系统第一次亮相时才注入它的脚本，两个系统不会同时加载。

## 结语

完...