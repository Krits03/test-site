---
title: 关于
description: 关于我和我的博客
date: 2026-09-26 00:05:00
updated: 2026-09-26 00:05:00
hideInfo: true
aside: [toc, blog-about, site, me]
---

这里是 wkr 的个人博客。平时把一些零碎想法，事情写在这儿。也算个开源爱好者，看到有意思的项目就忍不住想动手折腾一下。

## 我是谁

- 昵称 **wkr**，也写作 `Kr`，GitHub 上是 [Krits03](https://github.com/Krits03)
- 一名学生，开源爱好者，业余时间喜欢自己玩点东西

## 这个站点

站点于 2026 年 3 月上线，用 [Clarity](https://github.com/L33Z22L11/blog-v3) 搭的（主题名 Clarity，作者是纸鹿Zhilu），我在它基础上改了不少自己的东西。

文章大致分这么几类：

::card-list
- **技术**：工具、系统、部署、排障这类能直接复用的操作经验
- **开发**：代码实现、工程实践、开发方法
- **安全**：漏洞、CTF、恶意软件和安全事件分析
- **杂谈**：观点讨论、复盘反思、行业或产品观察
- **生活**：记录叙事，个人经历和日常片段
::

本站的大事小情都记在[站点日志](/site-logs)里，想到什么写什么，按时间倒序排。

## 技术栈

主要几层大概是这样：

| 层 | 用的东西 |
| --- | --- |
| 框架 | Nuxt 4 + Vue 3 + TypeScript |
| 内容 | Nuxt Content v3，Markdown 驱动，MDC 语法直接写组件 |
| 托管 | Vercel |
| 评论 | Twikoo + giscus 双系统，评论区可切换 |
| 评论数据 | MongoDB |
| 代码高亮 | Shiki |
| 包管理 | pnpm |

由于大量对博客站的提交，导致...
![](https://github-card.kr033.top/api/cards/most-commit-language?username=Krits03&theme=default&animation=stagger)

## 折腾记录

博客一直在改，最近一次是把评论区从单 Twikoo 扩成了 Twikoo + giscus 双系统：

::link-card
---
title: 站点双评论系统的折腾过程
description: 从单点 Twikoo 到 Twikoo + giscus 双评论系统
link: /2026/dual-comment-system
class: gradient-card active
---
::

评论图床那套也写过一篇：

::link-card
---
title: blob-s3-imgbed：把 Vercel Blob 改造成 S3 兼容图床
description: 把 Vercel Blob 包装成 S3 兼容 + 简单 HTTP 双接口的对象存储网关
icon: https://github.com/favicon.ico
link: /2026/blob-s3-imgbed
---
::

## 找到我

::card-list
- **GitHub**：[Krits03](https://github.com/Krits03)
- **邮箱**：`me@wkr-dev.top`{copy}
- **站点状态**：[status.wkr-dev.top](https://status.wkr-dev.top/)
- **订阅**：[Atom](/atom.xml)
::

完...  233~