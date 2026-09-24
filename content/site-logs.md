---
title: 站点日志
date: 2026-08-28 20:11:00
updated: 2026-08-31 10:30:00
categories: [技术]
aside: [toc]
tags: [Site, Logs, Vercel]
---

记录一下本站的折腾过程，想到什么写什么，按时间倒序排。

## 2026-09-24

- 改写文章 [blob-s3-imgbed：把 Vercel Blob 改造成 S3 兼容图床](/2026/blob-s3-imgbed)：同步项目改名与迁移到新仓库，接入方式改为 Twikoo 管理面板 S3 插件。
- 评论美化：加载 Twikoo 2.x 自定义样式，修复输入提示浮层遮挡输入框的问题。
- 外部脚本本地化/替换：统计换用 Umami 官方云服务，`script.js` 自托管为 `public/site-res/umami.js`；Twikoo 的人机验证组件改从 zstatic 加载（Twikoo 2.x 内置的 jsdmirror 地址不稳定）。
- favicon 改用 weavatar 头像，移除 site-res 下的自托管头像文件。

## 2026-08-31

- 维护无限期：开学。
- 更新文章banner

## 2026-08-30
- 新文章上线：[基于 Vercel Blob 构建 S3 兼容的对象存储网关](/2026/blob-s3-imgbed)。
- 添加 萌备-ICP20260477号

## 2026-08-28

- 把 Twikoo 升到 1.7.20，接入 Cloudflare Insights 统计。
