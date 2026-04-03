---
title: "提交 Pull Request"
topic: git
section: Workflow
order: 1
duration: 20
date: 2026-03-25
---

## 什么是 Pull Request？

Pull Request（PR）是向代码库提交更改的方式。不直接往 main 分支推代码，而是推到一个功能分支，让队友 review 之后再合并。

```
main 分支：      A --- B --- C
                            \
feature 分支：               D --- E  ← 你的改动
                                      ↑
                                   在这里开 PR
```

## 标准 PR 流程

**1. 创建功能分支**

永远从最新的 `main` 切出来：

```bash
git checkout main
git pull origin main
git checkout -b feature/add-login
```

分支命名规范：
- `feature/` — 新功能
- `fix/` — 修 bug
- `chore/` — 维护类任务（更新依赖、改配置）

**2. 改代码、提交**

```bash
git add .
git commit -m "feat: add login form with validation"
```

commit message 要解释"为什么"，而不只是"改了什么"：

```bash
# 差
git commit -m "update file"

# 好
git commit -m "fix: redirect to login when session expires"
```

**3. 把分支推到 GitHub**

```bash
git push origin feature/add-login
```

如果远端还没有这个分支，用 `-u` 设置 upstream：

```bash
git push -u origin feature/add-login
```

**4. 在 GitHub 上开 PR**

推完分支后，GitHub 会提示你开 PR。

一个好的 PR 描述应该包括：
- **做了什么**（1-2 句话）
- **为什么要做**
- **怎么测试**
- 如果有 UI 改动，附截图

**5. 处理 review 意见**

reviewer 留了意见之后，在本地改完再 push，PR 会自动更新：

```bash
# 改完代码...
git add .
git commit -m "fix: address review comments"
git push origin feature/add-login
```

**6. 合并**

approved 之后在 GitHub 上合并。合并完删掉功能分支，它已经完成使命了。

本地也清理一下：

```bash
git checkout main
git pull origin main
git branch -d feature/add-login
```

## 保持分支最新

大多数团队要求合并前分支必须基于最新的 `main`。永远用 rebase，不要把 `main` merge 进你的功能分支——那样会产生多余的 merge commit，污染历史记录。

```bash
git fetch origin
git rebase origin/main
```

rebase 会把你的 commit 重新"接"在最新 `main` 后面，历史是一条直线。

如果 rebase 时有冲突：

```bash
# 手动解决冲突...
git add .
git rebase --continue
```

### 把 git pull 默认设置为 rebase

`git pull` 默认会执行 merge。全局配置改成始终 rebase：

```bash
git config --global pull.rebase true
```

配置之后，`git pull` 等同于 `git fetch` + `git rebase`，再也不会产生多余的 merge commit。

### GitHub 如何强制线性历史

GitHub 合并 PR 时提供三种方式：

- **Merge commit** — 保留所有 commit，顶部加一个 merge commit
- **Squash and merge** — 把所有 commit 压成一个
- **Rebase and merge** — 把 commit 逐个接在 `main` 后面，没有 merge commit

很多团队会在 repo 设置里禁用第一种，只保留 Squash 或 Rebase，确保 `main` 始终是线性历史。

## 关键问题

> _Q：`git merge` 和 `git rebase` 有什么区别？_

两者都是把一个分支的改动整合到另一个分支。`merge` 会创建一个新的 merge commit，完整保留两个分支的历史。`rebase` 把你的 commit 重新"接"到目标分支的末尾，历史是一条直线，没有 merge commit。更新功能分支时用 rebase，最终合并进 main（通过 PR）时用 merge。

> _Q：为什么要用功能分支，不直接提交到 main？_

功能分支把开发中的代码和稳定代码隔离开。多个人可以同时开发不同功能，互不影响。同时让 code review 成为可能——代码只有经过 review 和 approve 才能进入 main，降低引入 bug 的风险。

> _Q：`git push -u origin branch-name` 里的 `-u` 是什么意思？_

`-u` 设置上游追踪关系。运行一次之后，以后直接用 `git push` 和 `git pull` 就行，不用再指定远端和分支名，Git 已经知道往哪里推和拉。

> _Q：一个好的 PR 描述应该包含什么？_

说清楚改了什么、为什么改、怎么验证。要足够简洁让 reviewer 快速看完，又要足够详细让没有上下文的人也能理解。UI 改动附截图。目标是减少 reviewer 的认知负担。

> _Q：`git fetch` 和 `git pull` 有什么区别？_

`git fetch` 从远端下载最新改动，但不应用到本地——工作区不变。`git pull` 相当于 `git fetch` + `git merge`（或 `git rebase`，取决于配置）。想先看看远端有什么改动再决定要不要合，用 `fetch`。
