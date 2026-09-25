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

- 改写文章 [blob-s3-imgbed](/2026/blob-s3-imgbed)：同步改名与新仓库，接入方式改为 Twikoo 面板 S3 插件。
- 评论升级 Twikoo 2.x：自定义样式美化，修复提示浮层遮挡输入框、灯箱图片堆积底部，灯箱加关闭按钮。
- 评论兼容：按 Twikoo 2.x 上游基线（ES2022）使用官方产物，不做语法降级。
- 脚本本地化：统计换 Umami 云服务；取消 jsdmirror，人机验证改从 zstatic 加载。
- 不稳定地址改写：Cap 的 wasm、pako 自托管到 `public/site-res/cap/`，评论代码高亮 Prism 改用 zstatic。
- favicon 换 weavatar 头像，移除自托管头像文件。

## 2026-08-31

- 维护无限期：开学。
- 更新文章 banner。

## 2026-08-30

- 新文章上线：[基于 Vercel Blob 构建 S3 兼容的对象存储网关](/2026/blob-s3-imgbed)。
- 添加萌备 ICP20260477 号。

## 2026-08-28

- Twikoo 升级到 1.7.20，接入 Cloudflare Insights 统计。
