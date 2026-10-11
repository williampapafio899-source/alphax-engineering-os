# Branching & Merging

## 1. Why This Matters

Branches are what make git a team tool. Without branches, every engineer would work on the same code simultaneously, breaking each other's work constantly. With branches, you can: build a new feature in isolation, fix a bug without disrupting development, run experiments safely, review code before it reaches production, and deploy specific sets of changes. Branching is the skill that separates solo developers from professional software engineers.

## 2. Mental Model

A branch is a **parallel timeline**:

- `main` = the main timeline (production-ready code)
- A feature branch = a parallel timeline where you make changes
- Merging = bringing a parallel timeline back into the main one
- Both timelines start from the same point (where you branched)

## 3. Powerful Analogy

Branches are like **parallel universes in a science fiction story**:

- You start in Universe A (main branch — working code)
- You create Universe B (feature branch) to experiment
- In Universe B, you can add a crazy new feature without risking Universe A
- If the feature works, you **merge** Universe B back into Universe A
- If it fails, you just delete Universe B — Universe A was never affected

## 4. Socratic Questions

- If you're building a feature that takes 2 weeks, how would you handle emergency bug fixes to production without branches?
- What's the difference between merging and rebasing?
- Why might two developers have a "merge conflict" on the same file?
- Should the main branch always be deployable? Why?

## 5. Deep Explanation

### What Is a Branch?

A branch is just a **pointer to a commit**. That's it. Creating a branch is nearly instant because git isn't copying any files — it's just creating a tiny reference file.

```
main ──▶ a3f4c92  (latest commit on main)
                         │
                    git checkout -b feature/login
                         │
feature/login ──▶ a3f4c92  (same commit! Branch just created)

After making commits on the feature branch:

main          ──▶ a3f4c92
                       │
feature/login ──▶ d7e9f01 ──▶ c4b8a23  (new commits on feature branch)
```

### Branch Commands

```bash
# Creating branches
git branch feature/login        # create branch (stay on current)
git checkout -b feature/login   # create AND switch to branch (classic)
git switch -c feature/login     # create AND switch (modern syntax)

# Switching branches
git checkout main               # classic
git switch main                 # modern

# Viewing branches
git branch                      # local branches
git branch -r                   # remote branches
git branch -a                   # all branches
git branch -v                   # with last commit info

# Deleting branches
git branch -d feature/login     # safe delete (must be merged)
git branch -D feature/login     # force delete (even if not merged)
```

### The HEAD Pointer

`HEAD` is a pointer to your current position. It usually points to a branch, which points to a commit:

```
HEAD → main → a3f4c92 → b7d3e11 → ...

After: git switch feature/login
HEAD → feature/login → d7e9f01 → ...
```

### Merging

```bash
# Merge feature into main:
git switch main
git merge feature/login

# Types of merges:
# 1. Fast-forward merge (no divergence — branch is ahead of main)
#    Git just moves main forward. Clean history.

# 2. Three-way merge (both branches have new commits)
#    Git creates a "merge commit" that has two parents.
#    This is normal and expected in team workflows.
```

**Fast-forward merge (linear history):**
```
Before:  main ──▶ A ──▶ B
                          └──▶ C ──▶ D ← feature/login

After:   main ──▶ A ──▶ B ──▶ C ──▶ D
                               ↑
                           (no merge commit — just moved)
```

**Three-way merge:**
```
Before:  main ──▶ A ──▶ B ──▶ E ── (main has new commit E)
                          └──▶ C ──▶ D ← feature/login

After:   main ──▶ A ──▶ B ──▶ E ──▶ M  (M = merge commit with 2 parents)
                          └──▶ C ──▶ D ─┘
```

### Merge Conflicts

When two branches change the same part of the same file, git can't auto-merge. It creates a conflict you must resolve:

```python
<<<<<<< HEAD (main branch version)
def get_user(id):
    return db.query(User).filter(id=id).first()
=======
def get_user(user_id):
    user = cache.get(f"user:{user_id}")
    if not user:
        user = db.query(User).filter(id=user_id).first()
        cache.set(f"user:{user_id}", user)
    return user
>>>>>>> feature/caching (feature branch version)
```

To resolve:
1. Edit the file to keep what you want (delete the `<<<<`, `====`, `>>>>` markers)
2. `git add conflicted_file.py`
3. `git commit -m "Merge feature/caching — keep caching version"`

### Rebasing

Rebase is an alternative to merge. Instead of creating a merge commit, it **replays your commits on top of the target branch**:

```bash
# Instead of merging main into feature:
git switch feature/login
git rebase main

# Result: feature/login commits are replayed on top of main
# Linear history, no merge commit
```

**Rebase gives linear history. Merge preserves history accurately.**
Use rebase for: cleaning up feature branches before PR.
Use merge for: integrating changes into main/long-lived branches.

## 6. Visual Thinking

```
BRANCHING WORKFLOW:

main:    A ──▶ B ──────────────────▶ E ──▶ M (merge commit)
               │                              ↑
               └──▶ C ──▶ D ──────────────────┘
               feature/login (your work)

REBASE RESULT:

main:    A ──▶ B ──▶ E ──▶ C' ──▶ D'
                           (C' and D' are replayed copies of C and D)
                           No merge commit — clean linear history
```

## 7. Real Engineering Examples

**Beginner:** Create a `fix/typo` branch, fix the typo, merge back to main. Main was untouched during the fix.

**Intermediate:** Two developers work on `feature/payment` and `feature/notifications` simultaneously. Neither affects the other. Both merge cleanly to main.

**Advanced:** A release branch `release/v2.3` is cut. Bug fixes are committed there and cherry-picked to main. The release ships while main continues development for v2.4.

**Industry:** GitFlow (or trunk-based development) — large engineering teams use formalized branching strategies to coordinate dozens of engineers working simultaneously.

## 8. Code Walkthrough

```bash
#!/bin/bash
# Branching and merging demonstration

cd /tmp && rm -rf branch-demo && mkdir branch-demo && cd branch-demo
git init -q && git config user.email "demo@eos.dev" && git config user.name "EOS Demo"

# ─── Main branch: initial state ─────────────────────────
cat > app.py << 'EOF'
def home():
    return "Welcome to my app"

def about():
    return "About us page"
EOF

git add app.py && git commit -q -m "Initial app structure"
echo "✅ Initial commit on main"

# ─── Create feature branch ──────────────────────────────
git switch -c feature/user-auth
echo ""
echo "=== On branch: $(git branch --show-current) ==="

cat >> app.py << 'EOF'

def login(email, password):
    # TODO: implement real auth
    return {"token": "abc123"}

def logout(token):
    return {"message": "Logged out"}
EOF

git add app.py && git commit -q -m "feat: add login and logout functions"
echo "✅ Added auth functions on feature branch"

# ─── Meanwhile, main gets a bugfix ──────────────────────
git switch main
cat > app.py << 'EOF'
def home():
    return "Welcome to Engineering OS"  # fixed: brand name

def about():
    return "About us page"
EOF

git add app.py && git commit -q -m "fix: correct brand name in home()"
echo "✅ Bug fix committed on main"

# ─── See the divergence ─────────────────────────────────
echo ""
echo "=== Git log (all branches) ==="
git log --oneline --graph --all

# ─── Merge feature into main ────────────────────────────
echo ""
echo "=== Merging feature/user-auth into main ==="
git merge feature/user-auth -m "Merge feature/user-auth: add authentication"

# ─── Result ─────────────────────────────────────────────
echo ""
echo "=== Final git log ==="
git log --oneline --graph --all

echo ""
echo "=== Final app.py ==="
cat app.py

# ─── Cleanup merged branch ──────────────────────────────
git branch -d feature/user-auth
echo ""
echo "✅ Feature branch deleted (merged)"
git branch
```

## 9. Failure Cases

**Long-lived branches**: A feature branch that exists for 2 months while main moves forward. When you finally merge, you have hundreds of conflicts. Fix: merge main into your feature branch frequently ("rebase often").

**Committing to wrong branch**: You make 3 commits to main instead of your feature branch. Fix: `git cherry-pick` the commits to feature branch, then `git reset` on main.

**Broken merge**: You resolve conflicts incorrectly and merge broken code to main. Fix: `git revert` the merge commit creates a clean revert.

**Deleted unmerged branch**: `git branch -D` on a branch with unique commits. Commits are still recoverable for ~30 days via `git reflog`.

## 10. Engineering Decisions

**Feature branches vs trunk-based development?**
- Feature branches: Natural for teams with PRs/code review. Risk of long-lived branches.
- Trunk-based: All commits go to main, behind feature flags. Simpler but requires discipline and flags infrastructure.

**Merge vs rebase for PRs?**
- Merge: Preserves history, shows exactly when things were integrated. Noisier graph.
- Squash merge: All feature commits squashed to one. Clean main history. Loses granular feature history.
- Rebase: Linear history. Rewrites SHA hashes. Never on shared branches.

## 11. Common Misconceptions

**"Rebase is better than merge"** — They solve different problems. Rebase gives clean history. Merge preserves accurate history. Neither is universally better.

**"Branches are expensive"** — Creating a branch in git is nearly free (creates one 41-byte file). Branch liberally.

**"Merge conflicts mean someone made a mistake"** — Conflicts are normal. They happen when two people change the same part of the same file. The resolution is a collaboration decision, not an error.

## 12. Guided Practice

**Level 1:** Create a branch, make 2 commits, switch back to main, merge the branch, delete the branch.

**Level 2:** Simulate a conflict: change the same line in both main and a feature branch. Resolve the conflict manually.

**Level 3:** Practice rebase: create a feature branch, make 3 commits, rebase it onto main (after main has advanced), verify linear history.

**Level 4:** Implement gitflow: create `develop`, `feature/x`, `release/v1.0`, and `hotfix/urgent-fix` branches following the gitflow pattern.

## 13. Quiz

**Q1.** What is a git branch fundamentally?
- a) A copy of all files in the repository
- b) A pointer to a specific commit
- c) A separate database of changes
- d) A backup of the main branch

**Q2.** When does a merge conflict occur?
- a) Whenever two people work on the same project
- b) When merging takes too long
- c) When two branches have changed the same region of the same file
- d) When a branch is too far behind main

**Q3.** What is the key difference between `git merge` and `git rebase`?
- a) Merge is faster; rebase is slower
- b) Merge creates a merge commit preserving history; rebase replays commits for linear history
- c) Merge works on local branches; rebase works on remote branches
- d) They are identical, just different syntax

**Answer Key:** B, C, B

## 14. Project Micro-Task

**Feature Branch Workflow**

In a real or practice project:
1. Create `feature/add-calculator` branch
2. Add a simple calculator module with 3 commits (add, subtract, multiply separately)
3. Meanwhile, make one commit on main (fix a README typo)
4. Merge your feature to main
5. Show the graph: `git log --oneline --graph --all`

## 15. Project Progression Ladder

**Level 1:** Branch, commit, merge, delete. Practice until it's muscle memory.

**Level 2:** Deliberately create and resolve a merge conflict.

**Level 3:** Use interactive rebase (`git rebase -i`) to clean up a messy feature branch before merging.

**Level 4:** Set up a gitflow workflow with `main`, `develop`, feature branches, and a release branch for a small project.

## 16. Knowledge Transfer

- **GitHub PRs / GitLab MRs**: Code review happens on branches before merging to main.
- **CI/CD**: Pipelines run on every branch push. Merging to main triggers deployment.
- **Feature flags**: Used with trunk-based development to deploy code without enabling features.
- **Release branching**: Many projects cut a release branch (`v2.3.x`) for maintenance while main continues.

## 17. Connection Map

**Before this:** Git Fundamentals (you need commits before you can branch)

**This enables:**
- Remote Repositories (branches are pushed to remotes)
- Professional Workflows (PR-based development)
- CI/CD (pipelines run per branch)
- Open source contribution (fork + branch + PR)

## 18. Expert Thinking

**Beginner:** "I'll just work on main and be careful not to break anything."
**Expert:** "Every new task = new branch. Branches are free. Breaking main costs team hours. Feature flags let me deploy incomplete features safely. I merge small, I merge often."

## 19. Expert Insights

> "The teams I've seen struggle with git almost always have the same problem: branches that live too long. Merge conflicts are the punishment for infrequent integration. Integrate daily and conflicts become trivial." — Engineering manager at a fintech scale-up

- `git merge --no-ff feature/x` forces a merge commit even for fast-forwards. Preserves the fact that a feature branch existed. Good for audit trails.
- Interactive rebase (`git rebase -i HEAD~5`) is the power tool for cleaning up commit history before PR review.

## 20. Memory Anchors

**Analogy:** Branch = parallel universe. Merge = bringing universes back together. Conflict = two universes changed the same thing differently.
**Mental image:** A tree branching out and coming back together — the git graph.
**Key phrase:** "Branch early, merge often, keep branches short-lived."
**Rule of thumb:** If your branch is more than a week old and hasn't been integrated, something is wrong.

## 21. First Principles Summary

**Three Key Ideas:**
1. A branch is just a movable pointer to a commit — creating one is free and instant.
2. Merging combines two diverged histories; rebasing replays one history on top of another.
3. Conflicts are normal — they require human judgment about which change wins.

**Three Things To Remember Forever:**
1. `git switch -c feature/name` to create and switch in one command.
2. `git log --oneline --graph --all` to visualize your branch structure.
3. Never rebase a shared/public branch — only rebase your own local branches.

**One-sentence definition:** Branching is git's mechanism for creating isolated lines of development that can be worked on independently and later integrated through merging or rebasing.

## 22. Mastery Challenge

Your team uses the following workflow:
- `main` is always deployable
- Features are developed on `feature/` branches
- A code review (PR) is required before merging
- No direct commits to main

You're tasked with adding a payment feature that requires changes to:
- `models/user.py`
- `services/payment.py` (new file)
- `api/endpoints.py`

While you're working, a critical bug fix is merged to main (it also touches `api/endpoints.py`).

1. Walk through every git command you'd use from branch creation to final merge.
2. How do you incorporate the bug fix into your feature branch?
3. You have 8 messy "WIP" commits — how do you clean them up before the PR?
4. Your PR is approved but main has moved forward again — what do you do?
5. How do you verify the final merge didn't break anything?
