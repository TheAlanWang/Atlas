---
title: "Submitting a Pull Request"
topic: git
section: Workflow
order: 1
duration: 20
date: 2026-03-25
---

## What is a Pull Request?

A Pull Request (PR) is a way to propose changes to a codebase. Instead of pushing directly to the main branch, you push to a feature branch and ask teammates to review your changes before merging.

```
main branch:      A --- B --- C
                             \
feature branch:               D --- E  ← your changes
                                       ↑
                                    open PR here
```

## The Standard PR Workflow

**1. Create a feature branch**

Always branch off from the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/add-login
```

Naming conventions:
- `feature/` — new functionality
- `fix/` — bug fixes
- `chore/` — maintenance tasks (dependency updates, config changes)

**2. Make your changes and commit**

```bash
git add .
git commit -m "feat: add login form with validation"
```

Write commit messages that explain *why*, not just *what*:

```bash
# bad
git commit -m "update file"

# good
git commit -m "fix: redirect to login when session expires"
```

**3. Push your branch to GitHub**

```bash
git push origin feature/add-login
```

If the branch doesn't exist on remote yet, use `-u` to set the upstream:

```bash
git push -u origin feature/add-login
```

**4. Open a Pull Request on GitHub**

Go to the repository on GitHub — you'll see a banner prompting you to open a PR from your recently pushed branch.

A good PR description includes:
- **What** the change does (1-2 sentences)
- **Why** it's needed
- **How to test** it
- Screenshots if UI changes are involved

**5. Address review comments**

When reviewers leave comments, make the changes locally and push again — the PR updates automatically:

```bash
# make changes...
git add .
git commit -m "fix: address review comments"
git push origin feature/add-login
```

**6. Merge**

Once approved, merge the PR on GitHub. Delete the feature branch after merging — it's no longer needed.

Then clean up locally:

```bash
git checkout main
git pull origin main
git branch -d feature/add-login
```

## Keeping Your Branch Up to Date

Most teams require your branch to be based on the latest `main` before merging. Always rebase — never merge `main` into your feature branch, as that creates unnecessary merge commits and pollutes the history.

```bash
git fetch origin
git rebase origin/main
```

Rebase replays your commits on top of the latest `main`, keeping history linear and clean.

If there are conflicts during rebase:

```bash
# fix conflicts in the files...
git add .
git rebase --continue
```

### Set rebase as the default for git pull

By default, `git pull` does a merge. Configure it globally to always rebase instead:

```bash
git config --global pull.rebase true
```

After this, `git pull` is equivalent to `git fetch` + `git rebase` — no extra merge commits, ever.

### How teams enforce linear history on GitHub

GitHub offers three merge strategies when closing a PR:

- **Merge commit** — preserves all commits with a merge commit on top
- **Squash and merge** — collapses all commits into one
- **Rebase and merge** — replays commits onto `main` with no merge commit

Many teams disable the first option in repository settings, allowing only Squash or Rebase, so the `main` branch always has a clean, linear history.

## Key Questions

> _Q: What is the difference between `git merge` and `git rebase`?_

Both integrate changes from one branch into another. `merge` creates a new merge commit that preserves the full history of both branches. `rebase` replays your commits on top of the target branch, producing a linear history with no merge commit. Rebase is preferred for keeping a feature branch up to date with `main`; merge is preferred for the final integration (via PR) to preserve the full context.

> _Q: Why do we use feature branches instead of committing directly to main?_

Feature branches isolate work in progress from stable code. They allow multiple developers to work in parallel without stepping on each other. They also make code review possible — changes only reach `main` after review and approval, reducing the risk of introducing bugs.

> _Q: What does `git push -u origin branch-name` do?_

The `-u` flag sets the upstream tracking reference. After running it once, you can use `git push` and `git pull` without specifying the remote and branch name — Git already knows where to push and pull from.

> _Q: What should a good PR description include?_

A good PR description explains what the change does, why it is needed, and how to test or verify it. It should be short enough to read quickly but detailed enough for a reviewer who has no context. Screenshots are helpful for UI changes. The goal is to reduce the reviewer's cognitive load.

> _Q: What is the difference between `git fetch` and `git pull`?_

`git fetch` downloads changes from the remote but does not apply them — your working directory stays unchanged. `git pull` is `git fetch` followed by a `git merge` (or `git rebase` if configured). Use `fetch` when you want to inspect changes before integrating them.
