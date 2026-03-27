---
title: "Git Basics"
topic: git
section: Introduction
order: 1
duration: 15
date: 2026-03-25
---

## What You'll Learn

- What Git is and why every developer uses it
- The difference between Git and GitHub
- How to set up Git and connect it to GitHub
- The core commands you'll use every day

---

## What is Git?

Git is a version control system — it tracks every change you make to your code over time. Instead of saving files like `project_v1.py`, `project_v2.py`, `project_final.py`, Git records a full history of changes so you can:

- Go back to any previous version
- See exactly what changed and when
- Work on new features without breaking existing code
- Collaborate with teammates without overwriting each other's work

Git runs locally on your machine. Your code history lives in a hidden `.git` folder inside your project.

## Git vs GitHub

These are two different things that work together:

| | Git | GitHub |
|---|---|---|
| **What it is** | A tool on your computer | A website |
| **What it does** | Tracks changes locally | Hosts your code online |
| **Works without the other?** | Yes | No — needs Git |

Git is the engine. GitHub is where you store and share your code remotely.

---

## Setting Up Git

**1. Install Git**

Check if Git is already installed:

```bash
git --version
```

If not, download it from [git-scm.com](https://git-scm.com).

**2. Set your identity**

Git attaches your name and email to every commit you make:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Do this once — it applies to all your projects.

**3. Set rebase as the default pull strategy**

```bash
git config --global pull.rebase true
```

This prevents unnecessary merge commits when you pull from remote. See the PR article for why this matters.

---

## Connecting to GitHub

**1. Create a repository on GitHub**

Go to GitHub → click **New repository** → give it a name → click **Create repository**.

**2. Initialize Git in your project**

```bash
cd your-project-folder
git init
git add .
git commit -m "first commit"
```

**3. Connect and push**

Copy the remote URL from GitHub, then:

```bash
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

Your code is now on GitHub. After this first push, you can just run `git push` to upload future commits.

---

## The Core Workflow

Once set up, your daily Git workflow is three commands:

```bash
git add .                        # stage your changes
git commit -m "describe change"  # save a snapshot
git push                         # upload to GitHub
```

To download the latest changes from GitHub:

```bash
git pull
```

---

## Interview Questions

> _Q: What is the difference between Git and GitHub?_

Git is a local version control tool — it tracks changes on your machine. GitHub is a cloud platform that hosts Git repositories so you can share code, collaborate with others, and back up your work remotely. You can use Git without GitHub, but GitHub requires Git.

> _Q: What does `git init` do?_

It initializes a new Git repository in the current directory by creating a hidden `.git` folder. This folder stores the entire history of your project — commits, branches, configuration. Without it, Git has nothing to track.

> _Q: What is a remote?_

A remote is a reference to a repository hosted somewhere else — typically GitHub. `origin` is the conventional name for the main remote. When you run `git push origin main`, you're pushing your local `main` branch to the `origin` remote.

> _Q: What does `git add` do?_

`git add` moves changes into the staging area — a holding zone for changes you want to include in the next commit. It lets you be selective: you can stage some files and leave others unstaged, so each commit contains only related changes.
