# Professional Git Workflows

## 1. Why This Matters

Knowing git commands is one thing. Using git professionally is another. Professional workflows answer: How does code move from "idea" to "in production" safely? How do teams of 10, 100, or 1,000 engineers coordinate without stepping on each other? How do you catch bugs before they reach users? How do you release confidently? The workflow is where git becomes the foundation of software engineering culture.

## 2. Mental Model

A professional git workflow is a **manufacturing assembly line**:

- Raw material (code) enters at one end (feature branch)
- Goes through quality checks (tests, code review)
- Gets assembled with other parts (merge)
- Undergoes final inspection (staging environment)
- Ships to customers (production deployment)

The workflow defines the rules of the assembly line — who can add what, where, when, and with what quality gates.

## 3. Powerful Analogy

Git workflows are like **publishing a newspaper**:

- Writers (developers) write articles (features) independently
- Editors (reviewers) review and approve articles before publication
- The layout team (CI) checks everything fits together
- The final edition (release) is printed only when everything is approved
- Emergency corrections (hotfixes) can be inserted at the last minute via a special fast-track process

Without this process, articles would conflict, contain errors, and the newspaper would be unreadable.

## 4. Socratic Questions

- What would happen if 10 engineers all committed directly to main with no review?
- Why do companies have staging environments? What problem do they solve?
- What's the difference between "code review" and "automated testing" in a workflow?
- How do you deploy a hotfix to production when main has half-finished features?

## 5. Deep Explanation

### The Pull Request (PR) Workflow

The PR workflow is the foundation of professional software development:

```
1. Create feature branch from main
   git switch -c feature/payment-integration

2. Make commits (small, focused, with good messages)
   git commit -m "feat: add Stripe API client"
   git commit -m "feat: implement charge() method"
   git commit -m "test: add payment integration tests"

3. Push branch to remote
   git push -u origin feature/payment-integration

4. Open Pull Request on GitHub/GitLab
   - Title: clear description of the change
   - Description: what, why, how to test
   - Link to issue/ticket

5. Code Review
   - Teammates review the diff
   - Leave comments, suggestions
   - Request changes or approve

6. CI/CD Checks pass
   - Tests run automatically
   - Linting checks
   - Security scans

7. Merge to main
   - Squash and merge (clean history)
   - Merge commit (preserve branch history)
   - Rebase and merge (linear history)

8. Delete feature branch (automated or manual)

9. Automatic deployment to staging/production
```

### Writing Good Commit Messages

```
# BAD commit messages:
fix
wip
stuff
changes
done

# GOOD commit messages (Conventional Commits format):
feat: add user authentication with JWT
fix: resolve race condition in payment processing
docs: update API documentation for v2 endpoints
test: add integration tests for checkout flow
refactor: extract payment logic into PaymentService class
chore: upgrade dependencies to latest versions

# Full commit message format:
feat(auth): add OAuth2 login with Google

Allow users to sign in using their Google account via OAuth2.
This eliminates the need for password management and improves
security by delegating to Google's authentication.

Closes #142
```

**Format:** `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Scope: optional, the component affected
- Description: imperative mood, lowercase, no period

### Code Review Best Practices

**As author:**
```
- Keep PRs small (< 400 lines changed when possible)
- Write a clear description: what and why
- Self-review your own diff first
- Respond to all comments (even if just "Done" or "No, because X")
- Don't take feedback personally
```

**As reviewer:**
```
- Review within 24 hours (unreviewed PRs block teammates)
- Be specific ("line 47: this will fail if user is null")
- Distinguish blocking ("must fix") from suggestions ("consider X")
- Approve when genuinely satisfied
- Be kind and constructive
```

### GitFlow

GitFlow is a branching model for teams with scheduled releases:

```
main        ─────────────────────────────────────────────▶
            │                           ↑                 │
            │                      release/v1.2           │
develop     ────────▶───────────────────────────────────▶
            │         │         ↑
feature/x   ──────────┘         │
feature/y             ────────────┘

hotfix/critical ──────────────────────────────────────────── main & develop
```

**Branches:**
- `main`: Production-ready code. Tagged with version numbers.
- `develop`: Integration branch. Features merge here.
- `feature/*`: Individual features. Branch from and merge to `develop`.
- `release/*`: Release preparation. Branch from `develop`. Merge to `main` and `develop`.
- `hotfix/*`: Emergency production fixes. Branch from `main`. Merge to `main` and `develop`.

### Trunk-Based Development

The modern alternative — simpler but requires discipline:

```
main  ──── A ──── B ──── C ──── D ──── E ──────▶
           │         │
           └─feature ┘ (short-lived, hours to days)
```

- **All engineers commit frequently to main** (or merge very short-lived branches)
- **Feature flags** hide incomplete features in production
- Requires strong CI (automated tests must be trustworthy)
- Used by Google, Facebook, Netflix at scale

### Semantic Versioning

Version numbers follow `MAJOR.MINOR.PATCH`:

```
v2.4.1
│ │ └─ PATCH: bug fixes, backward-compatible
│ └─── MINOR: new features, backward-compatible
└───── MAJOR: breaking changes

Examples:
v1.0.0 → v1.0.1 (bug fix)
v1.0.1 → v1.1.0 (new feature, still compatible)
v1.1.0 → v2.0.0 (breaking API change)
```

```bash
# Tagging releases
git tag -a v1.2.3 -m "Release v1.2.3 — payment integration"
git push origin v1.2.3
git push origin --tags

# View tags
git tag
git show v1.2.3
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest tests/ -v --tb=short
      - name: Run linter
        run: flake8 src/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: ./scripts/deploy.sh
```

## 6. Visual Thinking

```
PR-BASED WORKFLOW END TO END:

Developer             GitHub                  CI/CD System
    │                    │                        │
    │── push branch ───▶│                        │
    │── open PR ────────▶│                        │
    │                    │── trigger CI ─────────▶│
    │                    │                        │── run tests
    │                    │                        │── lint
    │◀── review needed ──│                        │── security scan
    │── address comments │                        │
    │── push fixes ─────▶│                        │
    │                    │── re-run CI ──────────▶│
    │                    │◀── all checks pass ─────│
    │◀── approved ───────│
    │── merge PR ────────▶│
    │                    │── deploy to staging ──▶│
    │                    │── deploy to prod ─────▶│
```

## 7. Real Engineering Examples

**Beginner:** First PR: add a README. Goes through review. Receives 2 suggestions. Fix them. Gets approved. Merged.

**Intermediate:** Feature branch open for 3 days. Main has moved. `git pull --rebase origin main` on feature branch, resolve conflicts, re-push. CI reruns. Merges cleanly.

**Advanced:** Hotfix needed in production. Branch from the production tag: `git checkout -b hotfix/payment-error v2.3.1`. Fix, test, merge to main AND develop, tag as `v2.3.2`, deploy.

**Industry:** Google uses "single repository" (monorepo) with trunk-based development. Every commit goes through 10,000+ automated tests before it can merge. The tests run in ~10 minutes thanks to distributed test execution.

## 8. Code Walkthrough

```bash
#!/bin/bash
# professional-workflow.sh — simulate a PR-based workflow

echo "=== PROFESSIONAL WORKFLOW SIMULATION ==="

# Setup
mkdir -p /tmp/workflow-demo && cd /tmp/workflow-demo
git init -q
git config user.email "lead@eos.dev" && git config user.name "Tech Lead"

# Initial main
cat > main.py << 'EOF'
"""Engineering OS API"""

def get_users():
    return []

def get_user(id):
    return None
EOF
git add . && git commit -q -m "feat: initial API structure"

echo "✅ Main initialized"

# ─── DEVELOPER CREATES FEATURE BRANCH ─────────────────────
git switch -c feature/user-cache -q
echo "Switched to: feature/user-cache"

# Multiple focused commits
cat > cache.py << 'EOF'
"""Simple in-memory cache"""

_cache = {}

def get(key):
    return _cache.get(key)

def set(key, value, ttl=300):
    _cache[key] = value  # simplified: no real TTL

def delete(key):
    _cache.pop(key, None)

def clear():
    _cache.clear()
EOF
git add cache.py && git commit -q -m "feat(cache): add in-memory cache module"

# Update main.py to use cache
cat > main.py << 'EOF'
"""Engineering OS API"""
from cache import get as cache_get, set as cache_set

def get_users():
    cached = cache_get("users")
    if cached:
        return cached
    users = []  # would query DB here
    cache_set("users", users)
    return users

def get_user(id):
    cached = cache_get(f"user:{id}")
    if cached:
        return cached
    user = None  # would query DB here
    if user:
        cache_set(f"user:{id}", user)
    return user
EOF
git add main.py && git commit -q -m "feat: integrate cache into user API"

# Add tests
cat > test_cache.py << 'EOF'
"""Tests for cache module"""
from cache import get, set, delete, clear

def test_set_and_get():
    set("key", "value")
    assert get("key") == "value"

def test_delete():
    set("key", "value")
    delete("key")
    assert get("key") is None

def test_cache_miss():
    assert get("nonexistent") is None

print("All tests passed! ✅")
EOF
git add test_cache.py && git commit -q -m "test: add cache module unit tests"
python3 test_cache.py

echo ""
echo "=== COMMITS ON FEATURE BRANCH ==="
git log --oneline

# ─── SIMULATE REVIEW: CLEAN UP COMMITS BEFORE PR ──────────
echo ""
echo "=== INTERACTIVE REBASE (squash WIP commits) ==="
echo "(In real life: git rebase -i HEAD~3 to squash commits)"
echo "Feature has 3 clean commits — no squashing needed here"

# ─── MERGE TO MAIN (simulate PR merge) ────────────────────
git switch main -q
git merge feature/user-cache --no-ff -m "Merge feature/user-cache: add caching layer

Adds in-memory caching for user API endpoints.
Reduces database load for repeated queries.

Reviewed-by: Tech Lead
Tested: unit tests pass" -q

echo ""
echo "=== FINAL MAIN HISTORY ==="
git log --oneline --graph

# ─── TAG THE RELEASE ──────────────────────────────────────
git tag -a v1.1.0 -m "Release v1.1.0 — user caching"
echo ""
echo "=== TAGGED v1.1.0 ==="
git tag

# ─── CLEANUP ─────────────────────────────────────────────
git branch -d feature/user-cache
cd ~ && rm -rf /tmp/workflow-demo
echo ""
echo "✅ Workflow demonstration complete"
```

## 9. Failure Cases

**Too-large PRs**: A 3,000-line PR is nearly impossible to review effectively. Reviewers rubber-stamp it, bugs slip through. Fix: enforce PR size limits. Break large features into reviewable chunks.

**Broken main**: A merge without CI checks breaks main. Everyone's local branches now need to rebase on a broken state. Fix: required status checks on main, never merge failing PRs.

**Review culture problems**: Reviewers approve without reading (to be "nice"). Quality degrades. Fix: review metrics, require 2 approvals, rotate reviewers.

**Hotfix nightmare**: A hotfix branch diverges so far from main that merging requires hours of conflict resolution. Fix: hotfix from the exact production tag, not a stale branch.

## 10. Engineering Decisions

**GitFlow vs trunk-based development?**
- GitFlow: Needed when releases are scheduled and discrete. Good for apps with quarterly releases.
- Trunk-based: Better for continuous deployment (deploy on every merge). Requires feature flags and strong CI.
- Recommendation: Start with a simple PR workflow. Add complexity only as needed.

**Squash merge vs merge commit vs rebase?**
- Squash merge: Clean main history (one commit per feature). Lose granular history.
- Merge commit: Preserve branch structure and when things merged. Noisier.
- Rebase: Linear history. Rewrites commits. Bad for public branches.
- Recommendation: Squash for most features. Merge commit for major releases.

## 11. Common Misconceptions

**"More process = safer software"** — Too much process slows teams and creates workarounds. The best teams have minimal but effective gates: tests + review. That's often enough.

**"Code review is about catching bugs"** — It's also about knowledge sharing, maintaining consistency, and collective ownership. A team that reviews code together writes more consistent code.

**"Main should always be perfect"** — Main should always be deployable. But "deployable" means tests pass and no obvious breakage — not "perfect." Perfect is the enemy of shipped.

## 12. Guided Practice

**Level 1:** Open a PR on GitHub for a project. Request a review from yourself (or a friend). Review your own diff.

**Level 2:** Write a PR description template for your project: what to include, how to test, what reviewers should focus on.

**Level 3:** Set up branch protection rules on a GitHub repo: require PR, require CI, prevent force push to main.

**Level 4:** Set up a complete CI/CD workflow with GitHub Actions: run tests on PR, deploy to "staging" (print a message) on merge to main.

## 13. Quiz

**Q1.** In Conventional Commits, what does `feat:` prefix indicate?
- a) A hotfix for production
- b) A new feature being added
- c) A refactoring of existing code
- d) A fix to documentation

**Q2.** What is the main advantage of keeping PRs small (< 400 lines)?
- a) Git performs better with smaller diffs
- b) Small PRs are easier to review thoroughly and merge more quickly
- c) CI runs faster on smaller changes
- d) GitHub has a 400-line limit on free plans

**Q3.** In GitFlow, where do hotfixes branch from?
- a) `develop`
- b) The most recent feature branch
- c) `main` (the production tag)
- d) A dedicated `staging` branch

**Answer Key:** B, B, C

## 14. Project Micro-Task

**PR Template + Workflow Setup**

For a real project:
1. Create `.github/pull_request_template.md` with sections: What changed, Why, How to test, Screenshots (if UI)
2. Set up branch protection on main: require PR, require 1 approval
3. Add a simple GitHub Actions workflow that runs your tests on every PR
4. Open a test PR and verify the workflow triggers

## 15. Project Progression Ladder

**Level 1:** Open your first PR on GitHub with a clear description.

**Level 2:** Review a teammate's PR (or a small open source PR) with specific, constructive comments.

**Level 3:** Set up a full CI pipeline with tests, linting, and code coverage report.

**Level 4:** Implement a deployment pipeline: tests on PR, staging deploy on merge to develop, production deploy on merge to main (simulated with echo commands).

## 16. Knowledge Transfer

- **Agile/Scrum**: "Definition of Done" often includes: code reviewed, tests written, PR merged. Git workflow enforces the process.
- **DevOps**: The git workflow IS the deployment pipeline entry point. Code doesn't move to production without passing through git.
- **Open source**: Every major project (React, Linux, Python) uses PR-based workflow. Contributing to open source = mastering this workflow.
- **SRE**: Post-mortems often trace outages to bypass of workflow (direct push to main without tests). Workflow = reliability.

## 17. Connection Map

**Before this:** Remote Repositories (PRs are opened against remotes)

**This enables:**
- CI/CD pipelines (triggered by workflow events)
- Code quality systems (linting, coverage)
- Security scanning (integrated into PR checks)
- Release management (versioning, changelogs)
- Team coordination at scale

## 18. Expert Thinking

**Beginner:** "My code works. Let me push it to main."
**Expert:** "My code works locally. Let me push to my feature branch. CI runs tests in a clean environment. A teammate reviews for correctness and design. Automated checks verify coverage didn't decrease. Only then does it merge to main, triggering automatic staging deployment and smoke tests."

## 19. Expert Insights

> "The teams with the best code quality I've ever seen aren't the ones with the strictest review process. They're the ones with the most trust — trust built by years of consistent quality from every team member. The workflow supports that culture. It doesn't replace it." — VP of Engineering

- Pair programming on complex features can replace code review — or supplement it. Both work.
- "Continuous deployment" (deploy on every merge) is only possible with excellent test coverage and a workflow that ensures every commit is deployable.
- The DORA metrics (Deployment Frequency, Lead Time, Change Failure Rate, MTTR) measure how good your workflow is. High performers deploy multiple times per day with < 1% failure rate.

## 20. Memory Anchors

**Analogy:** Git workflow = newspaper publishing. Writers → editors → layout → print. Each stage has a quality gate.
**Mental image:** The pipeline — code flows left to right from idea to production, gated at each step.
**Key phrase:** "Small PRs, fast reviews, automated checks, confident deploys."
**Rule of thumb:** If your main branch can't be deployed right now, your workflow has a gap.

## 21. First Principles Summary

**Three Key Ideas:**
1. Professional git workflows enforce quality gates — automated tests + human review — before code reaches production.
2. Good commit messages and small, focused PRs are acts of respect for your teammates and future self.
3. The workflow is a culture document as much as a technical one — it defines how a team collaborates.

**Three Things To Remember Forever:**
1. `feat:`, `fix:`, `docs:` — prefix your commits with Conventional Commits types.
2. Keep PRs small. One feature, one PR. Easier to review = higher quality.
3. Main must always be deployable. Every merge is a potential deployment.

**One-sentence definition:** A professional git workflow is the agreed-upon set of rules and automated checks that governs how code moves from developer laptops through review and testing into production safely and reliably.

## 22. Mastery Challenge

You're the first engineer at a 5-person startup. Design the complete git workflow for your team:

1. Choose: GitFlow, trunk-based, or your own hybrid — and justify your choice for a startup.
2. Define branch naming conventions, PR template, and merge strategy.
3. Design the CI/CD pipeline: what runs on PR? What runs on merge to main?
4. What branch protection rules do you set? What are the tradeoffs?
5. 6 months later the team grows to 20 engineers. What changes in your workflow? What breaks first?

Write this up as a technical decision document (Architecture Decision Record) with alternatives considered, decision made, and reasoning.
