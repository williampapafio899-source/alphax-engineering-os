# Git Fundamentals

## 1. Why This Matters

Git is the universal version control system. Every software company on earth uses it. Every open-source project lives on it. Every job interview expects it. Git lets you track every change to your code, travel back in time to any version, work on multiple features simultaneously, and collaborate with thousands of engineers without conflicts. The day you understand git is the day you stop being afraid of breaking things.

## 2. Mental Model

Git is a **time machine for your code**:

- Every time you make a meaningful change, you take a **snapshot** (commit)
- Every snapshot is timestamped, labeled, and linked to the previous one
- You can travel back to any snapshot at any time
- The chain of snapshots is your project's entire history — nothing is ever truly lost

## 3. Powerful Analogy

Git is like **tracked changes in a document, but supercharged**:

- Word's "Track Changes" shows who changed what — git does this for code
- But git also lets you: create parallel versions (branches), merge changes from multiple authors, go back to any previous version, compare any two versions
- Every developer works on their own copy (local repo). When ready, they merge their changes back to the shared version (remote repo).

## 4. Socratic Questions

- Why not just use "Save As" with a version number in the filename?
- How does git know what changed if you never tell it which files to watch?
- Why does git need both "add" and "commit" as two separate steps?
- What would it mean for two people to work on the same file at the same time?

## 5. Deep Explanation

### The Three Areas of Git

```
Working Directory   →   Staging Area   →   Repository
(your files)            (git add)           (git commit)
    │                       │                    │
Changes you made     Changes you've       Permanent history
but haven't         chosen to include    (commits, branches,
told git about       in next commit       tags, all history)
```

**Working Directory**: Your actual files on disk. Git watches these for changes.

**Staging Area (Index)**: A preparation area. You choose which changes go into the next commit. You can stage some changes from a file while leaving others unstaged.

**Repository (.git folder)**: The database where all commits live. The entire history of your project.

### The Core Git Loop

```bash
# 1. Make changes to files

# 2. See what changed
git status          # overview of changes
git diff            # exact line-by-line changes

# 3. Stage what you want in the commit
git add file.txt         # stage specific file
git add .                # stage all changes in current directory
git add -p               # interactively choose changes to stage

# 4. Commit the staged changes
git commit -m "Add user authentication"

# 5. Repeat
```

### What a Commit Is

A commit is a permanent snapshot containing:
- **Tree**: A snapshot of all tracked files at this moment
- **Parent**: Link to previous commit (forms the chain)
- **Author**: Who made the changes and when
- **Message**: Description of what changed and why
- **Hash**: Unique SHA-1 identifier (e.g., `a3f4c92`)

```bash
git log                          # see commit history
git log --oneline                # compact view
git log --oneline --graph        # visual branch graph
git show a3f4c92                 # see a specific commit
git diff HEAD~1 HEAD             # diff between last two commits
```

### Undoing Things

```bash
git restore file.txt             # discard working dir changes
git restore --staged file.txt    # unstage a file
git commit --amend               # fix last commit message (before push)
git revert abc123                # create new commit that undoes abc123
git reset --hard HEAD~1          # DANGER: delete last commit entirely
```

### .gitignore — Telling Git What to Ignore

```
# .gitignore
node_modules/
*.pyc
__pycache__/
.env
*.log
.DS_Store
dist/
build/
```

Files matching these patterns are never tracked. Critical for: build outputs, dependencies, secrets, OS files.

### Git Configuration

```bash
# First time setup (required)
git config --global user.name "William Papafio"
git config --global user.email "william@example.com"
git config --global core.editor "nano"        # or vim, code --wait

# View config
git config --list
```

## 6. Visual Thinking

```
GIT HISTORY (git log --oneline --graph):

* a3f4c92 (HEAD → main) Add payment processing
* b7d3e11 Fix authentication bug
* c9f2a00 Add user registration
* d4e8b15 Initial commit

Each commit stores:
┌────────────────────────────────────┐
│ Commit: a3f4c92                    │
│ Author: William Papafio            │
│ Date:   2026-06-01 09:30           │
│ Message: Add payment processing    │
│ Parent:  b7d3e11                   │
└────────────────────────────────────┘
              │
         links back to
              ▼
┌────────────────────────────────────┐
│ Commit: b7d3e11                    │
│ Parent:  c9f2a00                   │
└────────────────────────────────────┘
```

## 7. Real Engineering Examples

**Beginner:** You accidentally delete a file. `git restore deleted-file.py` brings it back instantly.

**Intermediate:** A bug appears in production. `git log` shows the bug was introduced in commit `b7d3e11`. `git show b7d3e11` reveals exactly what changed.

**Advanced:** `git bisect` automatically binary-searches through hundreds of commits to find the exact commit that introduced a bug.

**Industry:** Open source projects like Linux kernel have millions of commits. Git handles this efficiently because each commit stores only the diff, not the full file content.

## 8. Code Walkthrough

```bash
# Complete git workflow from scratch

# ─── Setup ────────────────────────────────────────────
mkdir my-project && cd my-project
git init
# Initialized empty Git repository in /home/william/my-project/.git/

# ─── Create files ─────────────────────────────────────
echo "# My Project" > README.md
echo "print('Hello, Engineering OS!')" > main.py
cat > .gitignore << EOF
__pycache__/
*.pyc
.env
EOF

# ─── First commit ─────────────────────────────────────
git status
# Untracked files: README.md, main.py, .gitignore

git add .
git status
# Changes to be committed: new file: README.md, main.py, .gitignore

git commit -m "Initial commit: project setup"
# [main (root-commit) a3f4c92] Initial commit: project setup

# ─── Make changes ─────────────────────────────────────
echo "def greet(name):
    return f'Hello, {name}!'" >> main.py

git diff
# Shows exactly which lines were added

git status
# modified: main.py

# ─── Stage and commit ─────────────────────────────────
git add main.py
git commit -m "Add greet() function"

# ─── View history ─────────────────────────────────────
git log --oneline
# b7d3e11 (HEAD -> main) Add greet() function
# a3f4c92 Initial commit: project setup

# ─── Oops — bad commit message, fix it ───────────────
git commit --amend -m "Add greet() function with name parameter"
# (only works before pushing!)

# ─── Explore history ──────────────────────────────────
git show b7d3e11                # see what that commit changed
git diff a3f4c92 HEAD           # changes between two commits
git log -p                      # full diff for each commit

# ─── Go back in time ──────────────────────────────────
git checkout a3f4c92 -- main.py # restore one file to old version
git restore main.py             # undo that, go back to latest
```

## 9. Failure Cases

**Committing secrets**: `git add .` accidentally includes `.env` with passwords. Even after deleting the file and recommitting, the secret is in history. Fix: `git-filter-repo` to rewrite history, then rotate all secrets.

**Losing uncommitted changes**: `git checkout otherbranch` when you have unstaged changes can discard them. Always `git stash` or commit first.

**Amending pushed commits**: `git commit --amend` after pushing to a shared branch rewrites history. Force-push overwrites the remote, breaking everyone else's local copy. Never amend public commits.

**Bad .gitignore**: Adding `node_modules/` to `.gitignore` after it was already committed doesn't untrack it. Must `git rm -r --cached node_modules/` first.

## 10. Engineering Decisions

**One big commit vs. many small commits?**
- Small, focused commits: Easier to review, revert, bisect. Each commit should be one logical change.
- One commit per feature (squash before merge): Cleaner history, easier to cherry-pick.
- Rule: If your commit message needs "and" in it, it should probably be two commits.

**When to commit?**
- When your code is in a working state and you've completed one logical unit of work
- At minimum: before switching tasks, before going to sleep, before any risky operation

## 11. Common Misconceptions

**"git add . always adds everything I want"** — It adds everything in the current directory (including things you didn't intend). Use `git status` and `git diff --staged` to verify before committing.

**"Committing saves my work to the cloud"** — Commit saves to your local repository. `git push` sends it to the remote. Don't confuse them.

**"I can't undo a commit"** — You can always undo with `git revert` (safe) or `git reset` (destructive, be careful). Git almost never permanently loses data.

## 12. Guided Practice

**Level 1:** Create a new directory, initialize a git repo, create 3 files, and make your first commit. Then run `git log` to verify.

**Level 2:** Make changes to multiple files. Stage only some of them. Commit. Then stage and commit the rest. Verify with `git log --oneline`.

**Level 3:** Use `git diff` to see changes before staging. Use `git add -p` to stage only specific parts of a file's changes.

**Level 4:** Simulate finding a bug: create 5 commits, introduce a "bug" in commit 3. Use `git bisect` to find it automatically.

## 13. Quiz

**Q1.** What does `git add` do?
- a) Creates a new file
- b) Moves changes from working directory to the staging area
- c) Saves changes permanently to the repository
- d) Downloads changes from the remote

**Q2.** You committed something with a typo in the message. You haven't pushed yet. What's the safest fix?
- a) Create a new commit with the corrected message
- b) `git commit --amend -m "Correct message"`
- c) Delete the .git folder and start over
- d) `git reset --hard HEAD~1` then recommit

**Q3.** What's the purpose of `.gitignore`?
- a) To ignore git commands you don't want to learn
- b) To list files and patterns git should not track
- c) To configure git's behavior globally
- d) To list files that are deleted

**Answer Key:** B, B, B

## 14. Project Micro-Task

**Track a Real Project**

Take any project folder (or create one), and:
1. Initialize a git repository
2. Create a meaningful `.gitignore`
3. Make your initial commit
4. Make 3 more meaningful changes, each in separate commits
5. Use `git log --oneline --graph` to see your history
6. Use `git diff HEAD~2 HEAD` to see the last two commits' changes

**Success criteria:** Clean git log with meaningful messages, proper .gitignore.

## 15. Project Progression Ladder

**Level 1:** Track a simple Python script with 5 commits.

**Level 2:** Practice undoing: make a bad change, stage it, then unstage it and restore the file.

**Level 3:** Use `git stash` to save work-in-progress, switch tasks, then restore.

**Level 4:** Set up pre-commit hooks that run linting before every commit.

## 16. Knowledge Transfer

- **GitHub/GitLab**: Web platforms built on top of git. They add: pull requests, code review, issue tracking, CI/CD. Git ≠ GitHub.
- **CI/CD**: Every push to git triggers the pipeline. The pipeline checks out your code via git.
- **Deployment**: Many deployment systems pull code with git: `git pull origin main && restart_service`.
- **Data science**: Git LFS (Large File Storage) tracks large model files and datasets using git.

## 17. Connection Map

**Before this:** Terminal and Linux (git runs entirely in the terminal)

**This enables:**
- Branching & Merging (parallel development)
- Remote Repositories (collaboration)
- Professional Workflows (PRs, code review)
- CI/CD pipelines
- Open source contribution

## 18. Expert Thinking

**Beginner:** "I'll just email the latest files to my teammate."
**Expert:** "Every change is committed with context. I can tell you what changed, why, when, and by whom for any line of code going back 5 years. And I can revert any single change in 10 seconds."

## 19. Expert Insights

> "A good commit message is a love letter to your future self. When you're debugging at 2am six months from now, you'll thank yourself for writing 'Fix: database connection pool exhaustion under high load (closes #342)' instead of 'fix stuff'." — Principal engineer

- Conventional Commits standard: `feat:`, `fix:`, `docs:`, `chore:` prefixes make history scannable and enable automated changelogs.
- `git reflog` is the ultimate safety net. It records every state HEAD has ever been in — even after `reset --hard`, you can recover.

## 20. Memory Anchors

**Analogy:** Git = time machine. Commit = save point. `git log` = time travel history.
**Mental image:** A chain of linked snapshots, each pointing to its parent.
**Key phrase:** "Stage what you want, commit to make it permanent."
**Rule of thumb:** Commit early, commit often. Small commits are easier to understand, review, and revert.

## 21. First Principles Summary

**Three Key Ideas:**
1. Git tracks changes to files as a series of commits — snapshots linked in a chain forming the project's history.
2. The three areas (working dir → staging → repository) give you control over what goes into each commit.
3. Every commit is uniquely identified by a hash — you can always go back to any point in history.

**Three Things To Remember Forever:**
1. `git status` before every `git add`. `git diff --staged` before every `git commit`.
2. Never commit secrets. Configure `.gitignore` before your first commit.
3. `git reflog` can recover almost anything — it's your safety net.

**One-sentence definition:** Git is a distributed version control system that tracks the complete history of a project as a series of snapshots (commits), enabling multiple people to work on the same code simultaneously without losing changes.

## 22. Mastery Challenge

You join a project with 3 years of git history and need to:

1. Find the commit that first added a `payments/` directory
2. Identify which developer has made the most commits in the last 90 days
3. Find all commits that touched `auth.py` in the last 6 months
4. Find the exact commit where a specific line of code was introduced
5. Create a one-liner that generates a changelog of all commits from last week

Solve each using git commands only (no GitHub UI). Document every command and its output.
