---
title: Git用法简记
description: 记录Git常用命令与写法规范，备忘记录emmm....   供参考
date: 2026-10-04 00:25:00
updated: 2026-10-04 00:25:00
image: https://r2-data.site.kr033.top/site/post/git-note/Git-Logo-2Color.png
categories: [技术, 开发]
aside: [toc]
tags: [Git, 规范, 笔记]
---

::alert
文章部分内容存在AI修改
::

## 一、初始配置

### 1.1 配置用户名和邮箱

每次提交都会记录作者信息，必须先配置：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

建议设置默认分支名：

```bash
git config --global init.defaultBranch main
```

设置编辑器：

```bash
# 使用 VS Code
git config --global core.editor "code --wait"

# 或使用 Vim
git config --global core.editor "vim"
```

查看配置：

```bash
git config --list --show-origin
```

### 1.2 配置 SSH

配置邮箱地址(账号邮箱)：

```bash
ssh-keygen -t ed25519 -C "邮箱@example.com"
```

查看公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

命令测试连通性：

```bash
ssh -T git@github.com
```

---

## 二、创建和获取仓库

### 2.1 在本地新建仓库

```bash
mkdir my-project
cd my-project
git init
```

查看状态：

```bash
git status
```

### 2.2 克隆远程仓库

```bash
git clone git@github.com:user/repo.git
```

指定目录名：

```bash
git clone git@github.com:user/repo.git my-dir
```

---

## 三、基础命令操作

### 3.1 一次标准提交流程

```bash
git status          # 查看哪些文件变了
git add <文件>       # 把修改放入暂存区
git commit -m "说明" # 提交到本地仓库
git push            # 推送到远程仓库
```

### 3.2 查看状态

```bash
git status
git status -s   # 简洁模式
```

### 3.3 暂存文件

```bash
git add README.md
git add src/
git add .          # 暂存当前目录所有变化
git add -A         # 暂存所有变化，包括删除
git add -p         # 交互式分块暂存，推荐
```

### 3.4 提交

```bash
git commit -m "feat: 添加登录功能"
```

如果文件已经被跟踪过，可以跳过 `git add`：

```bash
git commit -am "fix: 修复登录按钮"
```

注意：`-a` 不会包含新文件。

### 3.5 查看历史

```bash
git log
git log --oneline
git log --oneline --graph --decorate --all
git log -p          # 显示每次提交的差异
git shortlog -sn    # 按作者统计提交数
```

### 3.6 查看差异

```bash
git diff            # 工作区 vs 暂存区
git diff --staged   # 暂存区 vs 最近提交
git diff HEAD       # 工作区 vs 最近提交
```

---

## 四、远程仓库与协作

### 4.1 添加远程仓库

```bash
git remote add origin git@github.com:user/repo.git
git remote -v
```

### 4.2 首次推送

```bash
git push -u origin main
```

`-u` 会建立本地 `main` 和远程 `origin/main` 的跟踪关系。以后直接：

```bash
git push
```

### 4.3 拉取远程更新

```bash
git fetch origin          # 只下载，不合并
git pull origin main      # 下载并合并
git pull --rebase origin main  # 下载并变基，历史更整洁
```

推荐日常使用：

```bash
git pull --rebase
```

### 4.4 查看远程信息

```bash
git remote -v
git branch -vv
```

---

## 五、git commit 写法

### 5.1 基本写法

```bash
git add .
git commit -m "feat: 添加登录功能"
git commit -am "fix: 修复样式"        # 已跟踪文件
git commit                            # 打开编辑器写多行
git commit -m "标题" -m "正文"        # 多个 -m
git commit -F commit-message.txt      # 从文件读取
```

### 5.2 常用参数

| 参数 | 作用 |
|---|---|
| `-m "信息"` | 直接指定提交信息 |
| `-a` | 自动暂存已跟踪文件的修改 |
| `--amend` | 修改最近一次提交 |
| `--no-edit` | 配合 `--amend`，不修改提交信息 |
| `-v` | 在编辑器中显示 diff |
| `-p` / `--patch` | 交互式选择要提交的代码块 |
| `--allow-empty` | 允许空提交，常用于触发 CI |
| `-F <文件>` | 从文件读取提交信息 |
| `--author="Name <email>"` | 指定作者 |
| `--date="..."` | 指定提交日期 |
| `--no-verify` | 跳过 pre-commit / commit-msg 钩子 |
| `-S` | GPG 签名提交 |
| `--signoff` | 添加 `Signed-off-by` 行 |
| `--fixup <commit>` | 生成 fixup 提交 |
| `--squash <commit>` | 生成 squash 提交 |

示例：

```bash
git commit -v
git commit --amend --no-edit
git commit --allow-empty -m "ci: 触发流水线"
git commit --no-verify -m "wip: 临时提交"
```

### 5.3 多行提交信息

```bash
git commit -m "feat(auth): 添加手机号验证码登录" \
           -m "支持手机号+验证码登录，减少密码遗忘导致的用户流失。" \
           -m "Closes #42"
```

### 5.4 补充提交信息

```bash
git commit --amend
# 或
git commit --amend -m "原标题" -m "补充的正文"
```

---

## 六、Git 提交信息规范

### 6.1 基本格式

```text
feat(auth): 添加github快捷登录
```

- `type`：提交类型，必填
- `scope`：影响范围，可选
- `subject`：简短描述，必填

### 6.2 常用类型

| 类型 | 含义 |
|---|---|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档 |
| `style` | 格式调整，不影响逻辑 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `build` | 构建或依赖 |
| `ci` | CI 配置 |
| `chore` | 杂项 |
| `revert` | 回滚提交 |

### 6.3 示例

```text
feat(auth): 添加github快捷登录
fix(cart): 修复登录已知问题
docs(readme): 更新使用说明
refactor(api): api 重构，优化
perf(query): 优化加载性能
chore: 升级依赖版本
```

带正文和 issue：

```text
fix(api): 修复api相关问题

修复站点评论区图床API回调异常

Closes #42
```

- 破坏性变更用 `!` 或 `BREAKING CHANGE:` 标注
- 关联 issue 写 `Closes #42`、`Fixes #128`

破坏性变更：

```text
feat(api)!: 移除旧版登录接口

BREAKING CHANGE: /api/v1/login 已删除，请迁移到 /api/v2/login。
```

---

## 七、命令速查表

| 操作 | 命令 |
|---|---|
| 查看版本 | `git --version` |
| 配置用户 | `git config --global user.name "名字"` |
| 配置邮箱 | `git config --global user.email "邮箱"` |
| 初始化仓库 | `git init` |
| 克隆仓库 | `git clone <url>` |
| 查看状态 | `git status` |
| 暂存文件 | `git add <文件>` |
| 暂存所有 | `git add .` |
| 提交 | `git commit -m "信息"` |
| 查看历史 | `git log --oneline --graph --all` |
| 查看差异 | `git diff` |
| 创建分支 | `git switch -c <分支>` |
| 切换分支 | `git switch <分支>` |
| 合并分支 | `git merge <分支>` |
| 删除分支 | `git branch -d <分支>` |
| 添加远程 | `git remote add origin <url>` |
| 推送 | `git push` |
| 首次推送 | `git push -u origin main` |
| 拉取 | `git pull --rebase` |
| 获取远程 | `git fetch` |
| 放弃工作区修改 | `git restore <文件>` |
| 取消暂存 | `git restore --staged <文件>` |
| 修改最近提交 | `git commit --amend` |
| 回退提交 | `git reset --soft HEAD~1` |
| 撤销公共提交 | `git revert <commit>` |
| 暂存现场 | `git stash` |
| 恢复现场 | `git stash pop` |
| 标签 | `git tag -a v1.0.0 -m "版本"` |
| 查看救命日志 | `git reflog` |
