# Commit Message Guidelines

## Git Push Notes

`git push` itself does not have a comment field.

In practice, the important text in a real project is usually:

- the commit message
- the pull request title
- the pull request description

For Atlas, the main rule is to keep commit messages clear, short, and action-oriented.

## Branch Naming

Use this format:

```text
<short-description>
```

Recommended examples:

```text
chat-latency-logs
commit-message-guidelines
runtime-log-p95
```

Branch naming rules:

- Use lowercase letters.
- Use hyphens instead of spaces or underscores.
- Keep the name short and descriptive.
- Base the name on the main change, not every small edit in the branch.
- Do not require a tool-specific prefix.

To create a new branch:

```bash
git switch -c your-branch-name
```

## Commit Message Format

Use this format:

```text
<type>: <short summary>
```

Recommended types:

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation only
- `refactor`: internal cleanup without behavior change
- `chore`: maintenance work

## Atlas Rules

- Start with a lowercase type such as `feat` or `fix`.
- Write the summary in imperative mood: `add`, `update`, `remove`, `document`.
- Keep the summary focused on one logical change.
- Avoid vague messages like `update code` or `fix stuff`.
- If the change is mostly docs, use `docs:`.
- If the change affects user behavior, prefer `feat:` or `fix:`.

## Good Examples

```text
feat: add structured chat latency runtime logs
fix: handle chat stream failures in api route
docs: add commit message guidelines
```

## Bad Examples

```text
update
fix stuff
misc changes
```
