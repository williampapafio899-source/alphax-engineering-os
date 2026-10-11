# File Operations

## 1. Why This Matters

File operations are the foundation of scripting, deployment, and system administration. Every automated task — backing up databases, processing logs, deploying code, generating reports — involves creating, copying, moving, reading, and deleting files. Mastering file operations in the terminal transforms manual, error-prone tasks into reliable automated scripts.

## 2. Mental Model

File operations are like **working at a physical desk**:

- `cat` = reading a document
- `cp` = making a photocopy
- `mv` = physically moving a document to another drawer
- `rm` = shredding it
- `touch` = creating a blank sheet
- `mkdir` = creating a new folder
- `find` = searching through every drawer for a document
- Pipes (`|`) = passing documents from one person to another

## 3. Powerful Analogy

The terminal's file tools are like **a Swiss Army knife**:

- Each blade does one thing perfectly
- You can combine blades (pipe commands together) to do complex things
- `cat file.txt | grep "error" | sort | uniq -c` = read → filter errors → sort → count unique lines
- The power comes not from individual commands but from **combining** them

## 4. Socratic Questions

- Why can `cp` take seconds to copy a large file, but `mv` in the same filesystem is instant?
- Why does piping exist? Couldn't each command just do everything itself?
- What happens if you `cp` a file to a destination where a file already exists with that name?
- Why should you be careful with `*` (glob) wildcards when using `rm`?

## 5. Deep Explanation

### Creating Files and Directories

```bash
touch file.txt           # Create empty file (or update timestamp)
mkdir mydir              # Create directory
mkdir -p a/b/c           # Create nested directories (no error if exists)
echo "Hello" > file.txt  # Create file with content (overwrites!)
echo "World" >> file.txt # Append to file
```

### Reading Files

```bash
cat file.txt             # Print entire file
less file.txt            # Paged view (q to quit, / to search)
head -n 20 file.txt      # First 20 lines
tail -n 20 file.txt      # Last 20 lines
tail -f logfile.txt      # Follow — live updates as file grows
wc -l file.txt           # Count lines
wc -w file.txt           # Count words
```

### Copying and Moving

```bash
cp source.txt dest.txt           # Copy file
cp -r sourcedir/ destdir/        # Copy directory recursively
cp -p file.txt backup.txt        # Preserve timestamps/permissions
mv old.txt new.txt               # Rename (or move) file
mv file.txt /path/to/dir/        # Move to different directory
mv *.txt /backup/                # Move all .txt files
```

**Why `mv` is instant on same filesystem:** It only updates the directory entry (filename pointer). No data is copied. Across filesystems, `mv` must copy then delete.

### Deleting Files

```bash
rm file.txt              # Delete file (permanent, no recycle bin!)
rm -r mydir/             # Delete directory recursively
rm -rf mydir/            # Force delete (no confirmation prompts)
rmdir emptydir/          # Delete empty directory only
```

**Safety tip:** Use `rm -i` for interactive confirmation. Add `alias rm='rm -i'` to `.bashrc`.

### Finding Files

```bash
find . -name "*.py"               # Find all Python files
find . -name "*.log" -mtime +7    # Logs older than 7 days
find . -size +100M                # Files larger than 100MB
find . -type d -name "node_modules" # Find directories named node_modules
find /var/log -name "*.log" -newer /tmp/marker # Newer than marker file
```

### Searching Inside Files

```bash
grep "error" logfile.txt          # Find lines containing "error"
grep -i "error" logfile.txt       # Case-insensitive
grep -r "TODO" ./src/             # Recursive search in directory
grep -n "function" app.py         # Show line numbers
grep -c "error" logfile.txt       # Count matching lines
grep -v "debug" logfile.txt       # Invert — lines NOT matching
grep -E "error|warning" log.txt   # Extended regex — error OR warning
```

### The Power of Pipes

The pipe `|` sends output of one command as input to the next:

```bash
# Count how many .py files are in a project
find . -name "*.py" | wc -l

# Find the 10 most common errors in a log
grep "ERROR" app.log | sort | uniq -c | sort -rn | head -10

# Find all TODO comments across codebase
grep -r "TODO" ./src/ | grep -v ".git"

# List the 5 largest files in current directory
ls -lS | head -6
```

### Redirecting Input/Output

```bash
command > file.txt       # Redirect stdout to file (overwrite)
command >> file.txt      # Redirect stdout to file (append)
command 2> errors.txt    # Redirect stderr to file
command 2>&1             # Redirect stderr to stdout
command &> all.txt       # Redirect both stdout and stderr
command < input.txt      # Use file as stdin
```

### File Permissions (Quick Overview)

```bash
chmod +x script.sh       # Make executable
chmod 644 file.txt       # rw-r--r-- (owner: read/write, others: read)
chmod 755 script.sh      # rwxr-xr-x (owner: all, others: read/execute)
chown william:staff file # Change owner to william, group to staff
```

## 6. Visual Thinking

```
PIPELINE VISUALIZATION:

app.log                      (1,000,000 lines)
   │
   │ grep "ERROR"
   ▼
[ERROR] Database timeout     (5,000 lines — only errors)
[ERROR] Connection refused
[ERROR] Database timeout
   │
   │ grep -oP "(?<=\[ERROR\] ).*"   (extract message)
   ▼
Database timeout             (cleaned messages)
Connection refused
Database timeout
   │
   │ sort
   ▼
Connection refused           (alphabetically sorted)
Database timeout
Database timeout
   │
   │ uniq -c
   ▼
      1 Connection refused
      2 Database timeout
   │
   │ sort -rn
   ▼
      2 Database timeout    ← most common errors, highest first
      1 Connection refused
```

## 7. Real Engineering Examples

**Beginner:** Find all log files and count total lines: `find /var/log -name "*.log" | xargs wc -l`

**Intermediate:** Deployment script backs up config before overwriting: `cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak && cp new-config.conf /etc/nginx/nginx.conf`

**Advanced:** Monitor a log file for errors in real-time and send an alert: `tail -f app.log | grep --line-buffered "CRITICAL" | while read line; do echo "$line" | mail -s "ALERT" admin@company.com; done`

**Industry:** Netflix's deployment scripts use `find`, `cp`, and `rsync` to distribute media files across thousands of servers efficiently.

## 8. Code Walkthrough

```bash
#!/bin/bash
# Practical file operations script

# ─── Setup ────────────────────────────────────
WORKSPACE="$HOME/eos-practice"
mkdir -p "$WORKSPACE"/{logs,backup,output}
cd "$WORKSPACE"

# ─── Create test files ────────────────────────
for i in {1..5}; do
  echo "Log entry $i: INFO starting process" >> logs/app.log
  echo "Log entry $i: DEBUG processing item $i" >> logs/app.log
  echo "Log entry $i: ERROR failed to connect" >> logs/app.log
done
echo "Created: $(wc -l < logs/app.log) log lines"

# ─── Search and filter ────────────────────────
echo "--- Errors only ---"
grep "ERROR" logs/app.log

echo "--- Error count ---"
grep -c "ERROR" logs/app.log

# ─── Backup with timestamp ────────────────────
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp logs/app.log "backup/app_${TIMESTAMP}.log"
echo "Backed up to: backup/app_${TIMESTAMP}.log"

# ─── Process and save output ──────────────────
grep "ERROR" logs/app.log | sort | uniq -c | sort -rn > output/error_report.txt
echo "Error report:"
cat output/error_report.txt

# ─── Find large files ─────────────────────────
echo "--- Files over 1KB ---"
find "$WORKSPACE" -size +1k -type f -exec ls -lh {} \;

# ─── Cleanup old backups (older than 1 min in this demo) ──
find backup/ -name "*.log" -mmin +1 -delete
echo "Old backups cleaned"

# ─── Summary ─────────────────────────────────
echo "--- Workspace contents ---"
find "$WORKSPACE" -type f | sort
```

## 9. Failure Cases

**Glob expansion destroying files**: `rm -rf *.txt` — if you're in the wrong directory, all `.txt` files there are gone. Always `ls *.txt` first to see what matches.

**Overwriting with `>`**: `command > important-file.txt` — if `command` fails, the output is empty but the file is truncated immediately. Use `command > tmp.txt && mv tmp.txt important-file.txt`.

**`cp -r` directory to existing directory**: `cp -r src/ dest/` — if `dest/` already exists, creates `dest/src/` instead of merging. Behavior differs between Linux and macOS.

**Forgetting `-r` on directories**: `rm mydir` fails with "is a directory." Good — it's a safety guard. `rm -r mydir` confirms you know you're deleting recursively.

## 10. Engineering Decisions

**`cp` vs `rsync` for copying directories?**
- `cp -r`: Simple, always available
- `rsync`: Skips unchanged files (fast incremental), preserves symlinks, shows progress, works over SSH. Use `rsync` for large directories or remote copies.

**When to use `find` vs `ls`?**
- `ls`: Quick overview of one directory
- `find`: Recursive search, filtering by type/size/date/name. Use for scripting.

## 11. Common Misconceptions

**"Deleted files are gone"** — On Linux, if another process has the file open, it still exists on disk until that process closes it. `lsof | grep deleted` shows these.

**"`cat` is just for viewing"** — `cat` (concatenate) was designed to join files: `cat file1.txt file2.txt > combined.txt`. Viewing is a secondary use.

**"Pipes create temp files"** — No. Pipes are in-memory streams. The output of one command flows directly into the next without touching disk.

## 12. Guided Practice

**Level 1:** Create a directory structure with files using only terminal commands. Then list all files sorted by size.

**Level 2:** Find all `.log` files in `/var/log` (or a test directory). Count the total lines across all of them.

**Level 3:** Write a command pipeline that extracts all unique IP addresses from an nginx access log.

**Level 4:** Write a bash script that backs up a directory, keeps only the last 5 backups, and logs what it did.

## 13. Quiz

**Q1.** What does `tail -f app.log` do?
- a) Shows the last line of the file
- b) Deletes the file tail
- c) Continuously shows new lines added to the file
- d) Shows the file in reverse order

**Q2.** You want to count occurrences of the word "error" (case-insensitive) in a log file. Which command?
- a) `find -c "error" app.log`
- b) `grep -ic "error" app.log`
- c) `cat app.log | count "error"`
- d) `wc -w "error" app.log`

**Q3.** Why is `mv file.txt /destination/` nearly instant, but `cp file.txt /destination/` takes time proportional to file size?
- a) `mv` uses more CPU
- b) `mv` just updates the directory entry; `cp` copies every byte of data
- c) `mv` compresses the file during transfer
- d) `cp` is an older, slower command

**Answer Key:** C, B, B

## 14. Project Micro-Task

**Log Analyzer Script**

Write a bash script `analyze-log.sh` that:
1. Takes a log file path as argument
2. Counts total lines, error lines, warning lines
3. Finds the 5 most common error messages
4. Shows the first and last timestamp in the log
5. Outputs a summary report to both terminal and a file

## 15. Project Progression Ladder

**Level 1:** Copy, move, and organize files in a test directory using bash.

**Level 2:** Build a file backup script that copies files to a timestamped directory.

**Level 3:** Build a log rotation script: compress logs older than 7 days, delete logs older than 30 days.

**Level 4:** Build a file sync tool using `rsync` that mirrors a local directory to a remote server and keeps a log of what was transferred.

## 16. Knowledge Transfer

- **CI/CD pipelines**: Build scripts use `cp`, `mv`, `find`, and `rsync` extensively to prepare artifacts for deployment.
- **Docker**: `COPY` and `ADD` in Dockerfiles are the container equivalent of `cp`.
- **Python scripting**: `shutil.copy()`, `os.rename()`, `pathlib.Path` — all file operations, same concepts.
- **Git**: Under the hood, git uses the file system to store objects. Understanding file operations helps you understand git internals.

## 17. Connection Map

**Before this:** Terminal Navigation (you must know where you are to do file operations)

**This enables:**
- Bash scripting (automating file operations)
- System administration
- Deployment scripts
- Log analysis
- Git operations

## 18. Expert Thinking

**Beginner:** Manually opens files in GUI, copies them by drag-and-drop.
**Expert:** `find /var/log -name "*.log" -mtime -1 | xargs grep -l "CRITICAL" | xargs -I{} cp {} /backup/critical-$(date +%s)/` — one command to find, filter, and backup all critical logs from the last 24 hours.

## 19. Expert Insights

> "The day I learned `xargs` and process substitution was the day the terminal went from useful to magical. Suddenly I could combine any tools together in ways nobody anticipated." — Platform engineer

- `xargs` converts stdin lines into command arguments — the bridge between `find`/`grep` and other commands.
- `rsync --dry-run` shows exactly what would be copied without doing it. Always test destructive operations first.

## 20. Memory Anchors

**Analogy:** File operations = desk work. `cat` = read. `cp` = photocopy. `mv` = move to another drawer. `rm` = shred.
**Mental image:** A pipeline — data flowing like water through pipes, each command a filter or transformer.
**Key phrase:** "Pipes connect tools. One tool does one thing well."
**Rule of thumb:** `ls` before `rm`. Always see what matches before deleting.

## 21. First Principles Summary

**Three Key Ideas:**
1. Every file operation (copy, move, delete, search) has a dedicated terminal command — combined via pipes they solve complex problems.
2. Pipes pass output as input — enabling powerful command chains without temp files.
3. `rm` is permanent. The terminal has no recycle bin. Verify before deleting.

**Three Things To Remember Forever:**
1. `mv` in same filesystem = instant (pointer change). `cp` = always copies bytes.
2. `>` overwrites. `>>` appends. Mixing them up destroys data.
3. `grep -r` searches recursively. `find . -name` finds files. Both are essential.

**One-sentence definition:** File operations are the terminal commands for creating, reading, copying, moving, deleting, and searching files — combined with pipes to build powerful data processing pipelines.

## 22. Mastery Challenge

A production server has:
- 50GB of log files in `/var/log/app/` accumulated over 6 months
- Logs follow format: `app-YYYY-MM-DD.log`
- Free disk space is down to 5GB
- You need to find all logs containing "CRITICAL" errors from the last 30 days
- Archive them compressed to `/backup/` and delete logs older than 60 days

Write the complete bash script to accomplish this safely, with:
1. Pre-flight checks (available disk space, backup directory exists)
2. The find/archive/delete operations
3. A verification step that confirms what was done
4. Error handling (what happens if backup fails?)
5. A log of every action taken
