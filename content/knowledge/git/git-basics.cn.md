---
title: "Git 基础"
topic: git
section: Introduction
order: 1
duration: 15
date: 2026-03-25
---

## 学完你会掌握

- Git 是什么，为什么每个开发者都在用
- Git 和 GitHub 的区别
- 如何配置 Git 并连接到 GitHub
- 每天都会用到的核心命令

---

## Git 是什么？

Git 是一个版本控制系统——它记录你对代码的每一次改动。不用再存 `project_v1.py`、`project_v2.py`、`project_final.py` 这种文件了，Git 会帮你保存完整的修改历史，让你可以：

- 回到任意历史版本
- 查看改了什么、什么时候改的
- 在新功能分支上开发，不影响现有代码
- 和队友协作，互不覆盖对方的工作

Git 运行在你自己的电脑上，代码历史存储在项目里一个隐藏的 `.git` 文件夹中。

## Git vs GitHub

这是两个不同的东西，配合使用：

| | Git | GitHub |
|---|---|---|
| **是什么** | 你电脑上的工具 | 一个网站 |
| **做什么** | 本地追踪改动 | 在线托管代码 |
| **能单独用吗** | 可以 | 不行，依赖 Git |

Git 是引擎，GitHub 是你存放和分享代码的地方。

---

## 配置 Git

**1. 安装 Git**

检查是否已安装：

```bash
git --version
```

没有的话去 [git-scm.com](https://git-scm.com) 下载。

**2. 设置你的身份**

Git 会把你的名字和邮箱附在每次提交上：

```bash
git config --global user.name "你的名字"
git config --global user.email "you@example.com"
```

只需设置一次，对所有项目生效。

**3. 把默认 pull 策略设为 rebase**

```bash
git config --global pull.rebase true
```

这样 pull 的时候不会产生多余的 merge commit。具体原因见 PR 那篇文章。

---

## 连接到 GitHub

**1. 在 GitHub 创建仓库**

登录 GitHub → 点击 **New repository** → 填写名称 → 点击 **Create repository**。

**2. 在本地项目初始化 Git**

```bash
cd your-project-folder
git init
git add .
git commit -m "first commit"
```

**3. 关联远端并推送**

从 GitHub 复制仓库地址，然后：

```bash
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

代码现在在 GitHub 上了。之后每次提交只需 `git push` 就行。

---

## 核心工作流

配置完成后，日常 Git 就是三条命令：

```bash
git add .                      # 暂存改动
git commit -m "描述这次改动"    # 保存快照
git push                       # 上传到 GitHub
```

拉取 GitHub 上的最新改动：

```bash
git pull
```

---

## 关键问题

> _Q：Git 和 GitHub 有什么区别？_

Git 是本地版本控制工具，在你自己的电脑上追踪改动。GitHub 是云端平台，托管 Git 仓库，用于分享代码、团队协作和远程备份。Git 可以不用 GitHub，但 GitHub 依赖 Git。

> _Q：`git init` 做了什么？_

在当前目录创建一个新的 Git 仓库，具体是生成一个隐藏的 `.git` 文件夹。这个文件夹存储项目的完整历史——提交、分支、配置。没有它，Git 无从追踪。

> _Q：什么是 remote（远端）？_

remote 是对托管在其他地方的仓库的引用，通常是 GitHub。`origin` 是主远端的惯用名称。`git push origin main` 的意思是把本地 `main` 分支推送到 `origin` 远端。

> _Q：`git add` 做了什么？_

`git add` 把改动放入暂存区——一个等待下次提交的临时区域。它让你可以有选择地提交：只暂存部分文件，让每次提交只包含相关改动。
