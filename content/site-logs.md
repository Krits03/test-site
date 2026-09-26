---
title: 站点日志
date: 2026-08-28 20:11:00
updated: 2026-09-26 11:36:00
categories: [技术]
aside: [toc]
tags: [Site, Logs, Vercel]
---

记录一下本站的折腾过程，想到什么写什么，按时间倒序排。

## 2026-09-26

- 新增人类可读的 [订阅](/feed) 与 [站点地图](/sitemap) 页面，原始 XML / OPML 接口不变。
- cap.js 本地化到 `/site-res/cap/`，修复评论脚本加载失败。
- 移除 XSLT 样式表，消除浏览器弃用提示。
- 订阅源与地图改为构建时生成，每次部署自动刷新。
- 预渲染 /archive 修复构建链接检查 404。
- 日期按站点语言 zh-CN 本地化，技术信息图标改用 simple-icons。
- 404 页面添加返回首页按钮。

## 2026-09-25

- 评论系统使用 giscus：与 Twikoo 组成双评论系统，评论区右上角切换。
- 新文章上线：[站点双评论系统简记](/2026/dual-comment-system)。

## 2026-09-24

- 改写文章 [blob-s3-imgbed](/2026/blob-s3-imgbed)：同步改名与新仓库，接入方式改为 Twikoo 面板 S3 插件。
- 评论升级 Twikoo 2.x：自定义样式美化，修复提示浮层遮挡输入框、灯箱图片堆积底部，灯箱加关闭按钮。
- 脚本本地化：统计换 Umami 云服务。
- favicon 换 weavatar 头像，移除自托管头像文件。

## 2026-08-30

- 新文章上线：[基于 Vercel Blob 构建 S3 兼容的对象存储网关](/2026/blob-s3-imgbed)。
- 添加萌备 ICP20260477 号。

## 2026-08-28

- Twikoo 升级到 1.7.20，接入 Cloudflare Insights 统计。
