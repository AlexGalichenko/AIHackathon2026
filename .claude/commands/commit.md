Run the following git commands in parallel:
- `git status` to see all untracked and modified files
- `git diff` to see unstaged changes
- `git diff --cached` to see staged changes
- `git log --oneline -5` to see recent commit messages and follow the existing style

Analyze all changes and create a git commit following these rules:

**Branch check:**
- If on `main` or `master`: suggest a branch name as `<type>/<short-description>`, ask user to confirm, then run `git checkout -b <branch-name>` before committing
- If on a feature branch: proceed directly

**Staging:**
- Stage all modified and untracked files relevant to the changes (exclude `.env`, secrets, build artifacts)

**Commit message format (commitlint):**
- `<type>(<scope>): <subject>`
- Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
- Subject: lowercase start, no period, max 100 chars

**Create the commit** using a HEREDOC:
```
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

After committing, run `git status` to confirm success.
