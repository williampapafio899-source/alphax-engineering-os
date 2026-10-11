# Bash Scripting Basics

## 1. Why This Matters

Bash scripts automate everything. Deployments, backups, log rotation, testing, environment setup, data processing — all bash. Every DevOps pipeline, CI/CD system, and server startup sequence runs bash scripts. Engineers who can write reliable bash scripts are 10× more productive than those who can't. What takes you 30 minutes of manual work becomes a 5-second script that runs forever.

## 2. Mental Model

A bash script is a **recipe** for the terminal:

- Write down a sequence of terminal commands
- Add variables, conditions, and loops so it can adapt to different situations
- Run it once, or schedule it to run automatically
- The shell reads each line and executes it as if you typed it yourself

## 3. Powerful Analogy

Bash scripting is like **automating a checklist**:

- Before scripts: You manually run 15 commands to deploy. Sometimes you forget step 7. Sometimes you mistype step 12.
- After scripts: One command runs all 15 steps in the right order, checks for errors, and tells you if something went wrong.
- The script is the checklist. It's consistent, fast, and never forgets.

## 4. Socratic Questions

- If bash scripts are just terminal commands, why learn special syntax for variables and loops?
- What happens to a script when one of its commands fails? Should it continue?
- Why do scripts use `$1`, `$2` for arguments instead of asking the user?
- What's the difference between `=` and `==` in bash?

## 5. Deep Explanation

### Script Structure

```bash
#!/bin/bash
# This is a comment
# The first line (shebang) tells the OS which interpreter to use

echo "Hello, Engineering OS!"
```

**Shebang options:**
- `#!/bin/bash` — use bash specifically
- `#!/bin/sh` — use POSIX sh (more portable)
- `#!/usr/bin/env python3` — use python3 from PATH

### Variables

```bash
# Assignment (no spaces around =)
NAME="William"
AGE=25
PI=3.14159

# Usage ($ to expand)
echo "Hello, $NAME"
echo "You are ${AGE} years old"   # braces for clarity

# Command output into variable
CURRENT_DATE=$(date +%Y-%m-%d)
FILES=$(ls /tmp/*.log 2>/dev/null | wc -l)

# Read-only variable
readonly MAX_RETRIES=3

# Environment variables (available to child processes)
export DATABASE_URL="postgresql://localhost/mydb"
```

### Quoting Rules

```bash
NAME="John Doe"

echo $NAME           # John Doe — ok but risky if spaces
echo "$NAME"         # John Doe — safe, preserves spaces (use this)
echo '$NAME'         # $NAME — single quotes = no expansion
echo "Hello $NAME"   # Hello John Doe — double quotes expand variables
```

**Rule:** Always quote variable expansions: `"$NAME"` not `$NAME`.

### Arguments and Special Variables

```bash
#!/bin/bash
# Run with: ./script.sh arg1 arg2 arg3

echo "Script name: $0"
echo "First arg:   $1"
echo "Second arg:  $2"
echo "All args:    $@"
echo "Arg count:   $#"
echo "Last exit:   $?"     # exit code of previous command
echo "Script PID:  $$"
```

### Conditionals

```bash
# Basic if/elif/else
if [ "$1" = "hello" ]; then
    echo "You said hello!"
elif [ "$1" = "bye" ]; then
    echo "Goodbye!"
else
    echo "Unknown: $1"
fi

# Numeric comparisons
COUNT=5
if [ $COUNT -gt 3 ]; then echo "greater than 3"; fi
if [ $COUNT -eq 5 ]; then echo "equals 5"; fi
if [ $COUNT -lt 10 ]; then echo "less than 10"; fi
# -gt greater than, -lt less than, -ge/-le, -eq equal, -ne not equal

# String comparisons
[ "$A" = "$B" ]    # equal
[ "$A" != "$B" ]   # not equal
[ -z "$A" ]        # empty string
[ -n "$A" ]        # non-empty string

# File tests
[ -f "file.txt" ]  # file exists
[ -d "mydir" ]     # directory exists
[ -x "script.sh" ] # is executable
[ -r "file" ]      # is readable
[ -s "file" ]      # exists and not empty

# Modern style with [[ ]]
if [[ "$NAME" == *"William"* ]]; then  # glob matching
    echo "Name contains William"
fi
```

### Loops

```bash
# For loop — over list
for fruit in apple banana cherry; do
    echo "Fruit: $fruit"
done

# For loop — over files
for file in *.py; do
    echo "Processing: $file"
    python3 -m py_compile "$file"
done

# For loop — C-style
for ((i=1; i<=5; i++)); do
    echo "Count: $i"
done

# While loop
COUNT=0
while [ $COUNT -lt 5 ]; do
    echo "Count: $COUNT"
    COUNT=$((COUNT + 1))
done

# Until loop — runs until condition is true
until [ -f "ready.txt" ]; do
    echo "Waiting for ready.txt..."
    sleep 1
done

# Loop over command output
while IFS= read -r line; do
    echo "Line: $line"
done < input.txt
```

### Functions

```bash
# Define a function
greet() {
    local name="$1"    # local = only visible inside function
    local greeting="${2:-Hello}"  # default value if $2 not provided
    echo "$greeting, $name!"
}

# Call the function
greet "William"          # Hello, William!
greet "William" "Hey"    # Hey, William!

# Function with return value (exit codes)
check_file() {
    if [ -f "$1" ]; then
        return 0   # success
    else
        return 1   # failure
    fi
}

if check_file "config.json"; then
    echo "Config exists"
else
    echo "Config missing!"
    exit 1
fi
```

### Error Handling

```bash
#!/bin/bash
set -e          # Exit immediately on any error
set -u          # Error on undefined variables
set -o pipefail # Pipe fails if any command in it fails

# Combine: 
set -euo pipefail  # best practice for robust scripts

# Trap — run cleanup on exit or error
cleanup() {
    echo "Cleaning up..."
    rm -f /tmp/myapp.lock
}
trap cleanup EXIT  # runs cleanup when script exits (any reason)

# Manual error check
if ! cp source.txt dest.txt; then
    echo "ERROR: Copy failed!" >&2
    exit 1
fi

# Error with line number
trap 'echo "Error at line $LINENO"' ERR
```

## 6. Visual Thinking

```
SCRIPT EXECUTION FLOW:

#!/bin/bash
set -euo pipefail

BACKUP_DIR="$HOME/backups"     ← variable assignment
mkdir -p "$BACKUP_DIR"          ← create dir

for file in *.log; do           ← loop start
    if [ -s "$file" ]; then     ← condition: non-empty?
        cp "$file" "$BACKUP_DIR/"   ← copy
        echo "Backed up: $file"
    else
        echo "Skipped empty: $file"
    fi
done                            ← loop end

echo "Done! $(ls $BACKUP_DIR | wc -l) files backed up"
```

## 7. Real Engineering Examples

**Beginner:** A script that creates a standard project directory structure every time you start a new project.

**Intermediate:** A deployment script that: pulls latest code, installs dependencies, runs tests, restarts the service, and rolls back if anything fails.

**Advanced:** A log rotation script that compresses logs daily, deletes logs older than 30 days, and sends a summary email.

**Industry:** GitHub Actions, Jenkins pipelines, and CircleCI all run bash scripts as their fundamental execution unit. Every CI/CD pipeline is bash at its core.

## 8. Code Walkthrough

```bash
#!/bin/bash
# deploy.sh — A real-world deployment script
set -euo pipefail

# ─── Configuration ──────────────────────────────────────
APP_DIR="/var/www/myapp"
LOG_DIR="/var/log/myapp"
SERVICE="myapp"
BRANCH="${1:-main}"          # default to main if not provided
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ─── Colors for output ──────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'  # no color

log()   { echo -e "${GREEN}[$(date +%H:%M:%S)] $1${NC}"; }
warn()  { echo -e "${YELLOW}[WARN] $1${NC}" >&2; }
error() { echo -e "${RED}[ERROR] $1${NC}" >&2; exit 1; }

# ─── Pre-flight checks ──────────────────────────────────
log "Starting deployment of branch: $BRANCH"

[ -d "$APP_DIR" ] || error "App directory not found: $APP_DIR"
command -v git >/dev/null || error "git not installed"
command -v python3 >/dev/null || error "python3 not installed"

# ─── Backup current version ──────────────────────────────
BACKUP="$APP_DIR.backup.$TIMESTAMP"
log "Creating backup at: $BACKUP"
cp -r "$APP_DIR" "$BACKUP"

# ─── Rollback function ───────────────────────────────────
rollback() {
    warn "Deployment failed! Rolling back..."
    rm -rf "$APP_DIR"
    mv "$BACKUP" "$APP_DIR"
    sudo systemctl restart "$SERVICE" 2>/dev/null || true
    error "Rollback complete. Check logs for details."
}
trap rollback ERR  # trigger rollback on any error

# ─── Pull latest code ────────────────────────────────────
cd "$APP_DIR"
log "Pulling latest code..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# ─── Install dependencies ────────────────────────────────
log "Installing dependencies..."
pip3 install -r requirements.txt --quiet

# ─── Run tests ──────────────────────────────────────────
log "Running tests..."
python3 -m pytest tests/ -q --tb=short

# ─── Restart service ─────────────────────────────────────
log "Restarting service..."
sudo systemctl restart "$SERVICE"
sleep 2

# ─── Verify service is running ───────────────────────────
if systemctl is-active --quiet "$SERVICE"; then
    log "✅ Deployment successful!"
    rm -rf "$BACKUP"    # cleanup backup
else
    error "Service failed to start"
fi
```

## 9. Failure Cases

**Forgetting `set -e`**: Script continues after a failed command. A copy fails, but the script deletes the source anyway. Data lost.

**Unquoted variables with spaces**: `cp $SOURCE $DEST` — if `$SOURCE` is `"my file.txt"`, this tries to `cp my file.txt $DEST` (three arguments). Always: `cp "$SOURCE" "$DEST"`.

**Infinite loop**: `while true; do sleep 1; done` — needs a break condition or Ctrl+C to exit. Always have a maximum iteration count or timeout.

**Script not executable**: `./deploy.sh: Permission denied` — forgot `chmod +x deploy.sh`.

## 10. Engineering Decisions

**Bash vs Python for scripting?**
- Bash: File operations, running other commands, simple string processing. ≤ ~100 lines.
- Python: Complex logic, data manipulation, APIs, JSON, error handling. > ~100 lines.
- Rule: When you're `grep`-ing `awk`-ing `sed`-ing to parse JSON — switch to Python.

**`set -e` always?**
- Yes in deployment scripts (fail fast).
- Maybe not in interactive scripts where some failures are expected.

## 11. Common Misconceptions

**"Bash is only for Linux admins"** — CI/CD, GitHub Actions, Docker scripts, startup scripts — all bash. Every backend engineer needs it.

**"Scripts don't need error handling"** — Production scripts run at 3am without anyone watching. If step 3 fails silently and steps 4–10 continue on bad data, the damage can be severe.

**"Variables don't need quotes"** — They absolutely do. Unquoted variables with spaces, newlines, or special characters break in surprising ways.

## 12. Guided Practice

**Level 1:** Write a script `hello.sh` that takes a name as argument and prints "Hello, [name]!". Handle the case where no argument is provided.

**Level 2:** Write a script that backs up all `.py` files in the current directory to a `backup/` folder with a timestamp.

**Level 3:** Write a script that monitors a log file and sends an alert (prints to stderr) when it detects lines containing "CRITICAL".

**Level 4:** Write a deployment script for a Python web app: pull git, install requirements, run tests, restart service, rollback on failure.

## 13. Quiz

**Q1.** What does `set -e` do in a bash script?
- a) Enables verbose output showing each command
- b) Exits the script immediately if any command returns a non-zero exit code
- c) Sets environment variables
- d) Enables extended glob patterns

**Q2.** Why should you always quote variable expansions like `"$NAME"` instead of `$NAME`?
- a) For performance
- b) To prevent word splitting and glob expansion on values containing spaces or special characters
- c) It's only required for numbers
- d) Single quotes work the same way

**Q3.** What is the purpose of `local` in a bash function?
- a) Make the function accessible locally only
- b) Restrict the variable scope to the function so it doesn't pollute the global namespace
- c) Optimize the variable for performance
- d) Load the variable from a local file

**Answer Key:** B, B, B

## 14. Project Micro-Task

**Project Setup Script**

Write `new-project.sh` that:
1. Takes a project name as argument
2. Creates the directory structure: `src/`, `tests/`, `docs/`, `scripts/`
3. Creates starter files: `README.md`, `requirements.txt`, `.gitignore`
4. Initializes a git repository
5. Prints a success message with the project path

## 15. Project Progression Ladder

**Level 1:** Script that greets user, shows date, and lists current directory.

**Level 2:** Backup script with timestamped archives and cleanup of old backups.

**Level 3:** Monitoring script that checks disk space, memory, and CPU every minute and logs alerts when thresholds are exceeded.

**Level 4:** Full deployment script with: pre-checks, backup, deploy, test, verify, and automatic rollback on failure.

## 16. Knowledge Transfer

- **CI/CD**: GitHub Actions, Jenkins, CircleCI run bash (or sh) scripts as their execution units.
- **Docker**: `RUN`, `CMD`, `ENTRYPOINT` in Dockerfiles are bash commands.
- **Kubernetes**: Startup scripts, health checks, and init containers use bash.
- **Python**: `subprocess.run(["bash", "script.sh"])` — Python calling bash. Know both.
- **Make**: Makefile recipes are bash commands. Build systems everywhere.

## 17. Connection Map

**Before this:** File Operations and Permissions (scripts use these extensively)

**This enables:**
- Deployment automation
- CI/CD pipelines
- System administration
- Cron jobs and scheduled tasks
- Docker and container builds

## 18. Expert Thinking

**Beginner:** "I'll write a script and if it fails, I'll re-run it manually."
**Expert:** "Every script has `set -euo pipefail`, a `trap` for cleanup, descriptive error messages to stderr, and is tested with edge cases (empty files, missing directories, no network). It runs in production unattended."

## 19. Expert Insights

> "The best scripts I've ever read do one thing, have excellent error messages, and clean up after themselves no matter what happens. The worst ones I've read are 1000 lines long, do everything, and have no error handling." — DevOps lead at a Series B startup

- ShellCheck (`shellcheck script.sh`) is a static analyzer for bash scripts. Run it on every script you write. It catches 90% of common mistakes.
- Keep scripts short and focused. A 200-line bash script should probably be Python.

## 20. Memory Anchors

**Analogy:** Script = recipe. Variables = ingredients. Functions = sub-recipes. Loops = "repeat for each item." Conditions = "if X do Y else do Z."
**Mental image:** A flowchart — sequential commands with branches (if) and cycles (loops).
**Key phrase:** "Automate once, run forever. But only if it handles errors."
**Rule of thumb:** `set -euo pipefail` at the top of every production script. No exceptions.

## 21. First Principles Summary

**Three Key Ideas:**
1. A bash script is a text file of shell commands that the shell executes sequentially, with variables, conditions, and loops for control flow.
2. Error handling (`set -e`, `trap`) is not optional in production scripts — scripts run unattended.
3. Always quote variables, use functions for reusable code, and keep scripts focused on one task.

**Three Things To Remember Forever:**
1. `set -euo pipefail` — the three-word safety net for every script.
2. Quote your variables: `"$VAR"` not `$VAR`.
3. `trap cleanup EXIT` — run cleanup code no matter how the script ends.

**One-sentence definition:** A bash script is a file of shell commands with control flow constructs (variables, functions, conditions, loops) that automates repetitive tasks the OS can execute without human interaction.

## 22. Mastery Challenge

Write a complete, production-quality backup system in bash:

1. Backs up a list of directories (configurable at top of script)
2. Creates compressed, timestamped archives (`.tar.gz`)
3. Keeps only the last 7 daily backups (deletes older ones)
4. Verifies each backup is uncorrupted after creation
5. Logs all operations with timestamps to a log file
6. Sends a success/failure summary (via echo to a "notification channel")
7. Handles all errors gracefully — never silently fails
8. Works correctly with directories that have spaces in their names

The script must pass ShellCheck with no errors.
