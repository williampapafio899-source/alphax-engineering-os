# Processes & Jobs

## 1. Why This Matters

When your web server stops responding, you need to find the stuck process and kill it. When a script is eating 100% CPU, you need to pause it without losing progress. When you close your SSH session, you need your background tasks to keep running. Understanding processes, signals, and job control is what separates engineers who panic in production from those who stay calm and fix it in 60 seconds.

## 2. Mental Model

Processes are **running programs with their own state and identity**:

- Every program you run becomes a process with a unique ID (PID)
- Processes can be running, sleeping, stopped, or zombie
- The OS juggles all processes using the scheduler
- You communicate with processes using **signals** (messages)
- Jobs are processes you launched from your terminal session

## 3. Powerful Analogy

Processes are like **employees in an office**:

- Each employee (process) has an ID badge (PID)
- The manager (OS scheduler) decides who works when
- You can tell an employee to stop (`Ctrl+Z`), continue (`fg`), or quit (`kill`)
- An employee working in a back room (`&`) keeps working even when you leave
- If the manager (OS) is overloaded, some employees work slower

## 4. Socratic Questions

- Why can't you just close a terminal window to stop a program running inside it?
- If two programs both need the CPU at the same time, what actually happens?
- What's the difference between "pausing" a process and "killing" it?
- Why do some processes keep running after you `kill` them?

## 5. Deep Explanation

### Viewing Processes

```bash
ps aux              # all processes, detailed
ps aux | grep nginx # find nginx processes
pgrep nginx         # get PIDs of processes matching name
pidof nginx         # same, slightly different output

top                 # live process viewer (q to quit)
htop                # better live viewer (install separately)
```

**`ps aux` output:**
```
USER       PID  %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND
william   1234  0.0  0.1  12345  4567 pts/0  S    09:00   0:00 bash
william   5678 15.3  2.4 123456 98765 pts/1  R    09:30   2:15 python3 train.py
root        99  0.0  0.0   1234   567 ?      Ss   08:00   0:05 sshd
```

**STAT codes:**
- `R` = Running
- `S` = Sleeping (waiting for I/O or event)
- `D` = Uninterruptible sleep (waiting for disk I/O)
- `Z` = Zombie (finished but parent hasn't cleaned up)
- `T` = Stopped
- `s` = Session leader
- `+` = Foreground process group

### Process Hierarchy

Every process has a parent. The first process (PID 1, systemd or init) is the ancestor of all processes:

```bash
pstree              # show process tree
pstree -p           # include PIDs

# Output:
# systemd───sshd───bash───python3
#         └─nginx──┬─worker
#                  └─worker
```

When a parent dies, orphaned children are adopted by PID 1.

### Signals

Signals are messages sent to processes:

```bash
kill -TERM 1234     # Politely ask process to stop (default)
kill -KILL 1234     # Force-kill (cannot be ignored)
kill -HUP 1234      # Hang up (many daemons reload config)
kill -STOP 1234     # Pause process
kill -CONT 1234     # Resume paused process

killall nginx       # kill all processes named nginx
pkill -f "python3"  # kill processes matching pattern

# Signal numbers:
# SIGHUP  (1)  = hang up / reload
# SIGINT  (2)  = interrupt (Ctrl+C)
# SIGTERM (15) = graceful terminate (default kill)
# SIGKILL (9)  = force kill (cannot be caught or ignored)
```

**Important:** `SIGKILL` (9) bypasses the program entirely. The OS removes the process immediately. Use it only as a last resort because the program has no chance to clean up.

### Job Control

The shell lets you manage multiple processes in one terminal session:

```bash
command &           # run in background
Ctrl+C              # send SIGINT to foreground process (terminate)
Ctrl+Z              # send SIGTSTP to foreground process (pause/stop)
jobs                # list all background/stopped jobs
fg                  # bring most recent job to foreground
fg %2               # bring job #2 to foreground
bg                  # resume stopped job in background
bg %2               # resume job #2 in background

# Example session:
$ sleep 100 &
[1] 12345           ← job 1, PID 12345

$ python3 server.py &
[2] 12346           ← job 2, PID 12346

$ jobs
[1]  Running    sleep 100 &
[2]+ Running    python3 server.py &

$ fg %1             ← bring sleep to foreground
sleep 100
^Z                  ← Ctrl+Z to pause
[1]+  Stopped   sleep 100

$ bg %1             ← resume sleep in background
[1]+ sleep 100 &
```

### Keeping Processes Alive After SSH Disconnect

When your SSH session ends, a `SIGHUP` is sent to all processes in that session. They die.

**Solutions:**

```bash
# nohup — immune to SIGHUP
nohup python3 train.py > train.log 2>&1 &

# screen — full terminal multiplexer
screen -S mysession   # start named session
# ... run your program ...
# Ctrl+A, D           # detach (program keeps running)
screen -r mysession   # reattach later

# tmux — modern terminal multiplexer (preferred)
tmux new -s train     # new session called 'train'
# ... run your program ...
# Ctrl+B, D           # detach
tmux attach -t train  # reattach from anywhere
```

### Process Priority (nice)

```bash
nice -n 10 python3 heavy.py    # run with lower priority (0-19, higher = nicer = lower priority)
nice -n -10 python3 realtime.py  # higher priority (needs sudo for negative)
renice 5 -p 1234               # change priority of running process
```

### Resource Monitoring

```bash
lsof -p 1234            # all files opened by PID 1234
lsof -i :3000           # which process is using port 3000?
lsof -u william         # all files opened by user william
strace -p 1234          # trace system calls (advanced debugging)
vmstat 1                # memory/cpu/io stats every 1 second
iostat 1                # disk I/O stats
```

## 6. Visual Thinking

```
PROCESS STATES:

                 ┌──────┐
    created ────▶│READY │◀────── SIGCONT (resumed)
                 └──┬───┘
                    │ scheduler gives CPU
                    ▼
                 ┌──────┐
    SIGSTOP ◀───│ RUN  │────▶ finishes → EXIT
                 └──┬───┘
                    │ waiting for I/O
                    ▼
                 ┌──────┐
                 │SLEEP │────▶ READY (I/O done)
                 └──────┘

SIGKILL skips all states → immediate removal from OS process table
```

## 7. Real Engineering Examples

**Beginner:** Server won't start because port 3000 is already in use. `lsof -i :3000` → find PID → `kill PID`.

**Intermediate:** Long-running ML training job. Start with `tmux`, detach, close laptop, reconnect 6 hours later and check progress.

**Advanced:** Nginx receives `SIGHUP` to reload its configuration without dropping connections. In-flight requests complete normally. New requests use new config. Zero downtime.

**Industry:** Kubernetes sends `SIGTERM` when scaling down a pod. The app has 30 seconds to finish serving requests and shut down cleanly. Then `SIGKILL` if it hasn't stopped.

## 8. Code Walkthrough

```bash
#!/bin/bash
# process-manager.sh — practical process management

# ─── Find a running process ──────────────────────────────
find_process() {
    local name="$1"
    local pids=$(pgrep -f "$name")
    
    if [ -z "$pids" ]; then
        echo "No process found matching: $name"
        return 1
    fi
    
    echo "Found processes matching '$name':"
    for pid in $pids; do
        echo "  PID $pid: $(ps -p $pid -o comm= 2>/dev/null)"
    done
}

# ─── Graceful shutdown with fallback ─────────────────────
graceful_kill() {
    local pid="$1"
    local timeout="${2:-10}"
    
    if ! kill -0 "$pid" 2>/dev/null; then
        echo "PID $pid not running"
        return 1
    fi
    
    echo "Sending SIGTERM to PID $pid..."
    kill -TERM "$pid"
    
    # Wait for graceful shutdown
    local waited=0
    while kill -0 "$pid" 2>/dev/null; do
        sleep 1
        waited=$((waited + 1))
        if [ $waited -ge $timeout ]; then
            echo "Process didn't stop after ${timeout}s. Sending SIGKILL..."
            kill -KILL "$pid"
            return 1
        fi
    done
    
    echo "Process $pid stopped gracefully after ${waited}s"
}

# ─── Monitor a process ────────────────────────────────────
monitor_process() {
    local pid="$1"
    local interval="${2:-5}"
    
    echo "Monitoring PID $pid (Ctrl+C to stop)"
    while kill -0 "$pid" 2>/dev/null; do
        local cpu=$(ps -p "$pid" -o %cpu= 2>/dev/null | tr -d ' ')
        local mem=$(ps -p "$pid" -o %mem= 2>/dev/null | tr -d ' ')
        echo "$(date +%H:%M:%S) | CPU: ${cpu}% | MEM: ${mem}%"
        sleep "$interval"
    done
    echo "Process $pid has exited."
}

# ─── Check what's using a port ───────────────────────────
port_info() {
    local port="$1"
    local result=$(lsof -i ":$port" 2>/dev/null)
    
    if [ -z "$result" ]; then
        echo "Port $port is free"
    else
        echo "Port $port is in use:"
        echo "$result"
    fi
}

# ─── Demo ────────────────────────────────────────────────
echo "=== Starting a background job ==="
sleep 60 &
BG_PID=$!
echo "Started sleep with PID: $BG_PID"

echo ""
echo "=== Jobs ==="
jobs

echo ""
echo "=== Monitor for 3 seconds ==="
monitor_process $BG_PID 1 &
MONITOR_PID=$!
sleep 3
kill $MONITOR_PID 2>/dev/null

echo ""
echo "=== Graceful kill ==="
graceful_kill $BG_PID 5

echo ""
echo "=== Port info ==="
port_info 80
port_info 3000
```

## 9. Failure Cases

**Zombie processes**: Child exits but parent never calls `wait()`. The zombie stays in the process table indefinitely. `ps aux | grep Z` finds them. Fix: restart the parent process.

**`kill -9` causing data corruption**: A database process is killed mid-write. The file is left in an inconsistent state. Always try `SIGTERM` first and give the process time to flush.

**Port in use after crash**: Process crashed but the OS hasn't freed the port yet (TIME_WAIT state). Fix: `SO_REUSEADDR` socket option in code, or wait ~60 seconds.

**Runaway process**: Process escapes job control and PID is unknown. `pgrep -f "python train"` or `ps aux | grep train` to find it.

## 10. Engineering Decisions

**SIGTERM vs SIGKILL?**
- Always try SIGTERM first. Give the process 10–30 seconds.
- SIGKILL only if SIGTERM doesn't work.
- In scripts: `kill PID; sleep 10; kill -0 PID 2>/dev/null && kill -9 PID`

**`nohup` vs `screen` vs `tmux`?**
- `nohup`: Simple, one-off background jobs.
- `screen`/`tmux`: When you need to interact with a running process later.
- `tmux` is the modern choice — split panes, session management, scriptable.

## 11. Common Misconceptions

**"`kill` always kills"** — `kill` sends a signal. Default is SIGTERM (request to stop). The program can catch and ignore it. Only `kill -9` (SIGKILL) is guaranteed.

**"Closing the terminal kills all programs"** — Programs running in the background with `nohup` or in `tmux`/`screen` keep running.

**"A zombie process is using resources"** — Zombies consume only a process table entry. They use no CPU or memory. Their PID is reserved until the parent reads their exit status.

## 12. Guided Practice

**Level 1:** Find all processes using more than 10% CPU on your machine. What are they?

**Level 2:** Start a long-running command in the background. Pause it with Ctrl+Z. Check `jobs`. Resume it in the background. Then bring it to the foreground and kill it.

**Level 3:** Write a bash script that starts a process, monitors its CPU/memory, and automatically kills it if CPU exceeds 90% for more than 30 seconds.

**Level 4:** Set up a tmux session with 3 panes: one running a web server, one tailing its logs, one ready for commands. Detach and reattach.

## 13. Quiz

**Q1.** What signal does `Ctrl+C` send to the foreground process?
- a) SIGKILL (9)
- b) SIGTERM (15)
- c) SIGINT (2)
- d) SIGHUP (1)

**Q2.** A process receives `SIGTERM` but keeps running. What should you do?
- a) Immediately send `SIGKILL`
- b) Reboot the system
- c) Wait a reasonable time (10–30s) then send `SIGKILL` if still running
- d) Send `SIGHUP` instead

**Q3.** You close your SSH session and your background Python script stops. How do you prevent this?
- a) Use `chmod +x` on the script
- b) Run the script with `nohup` or inside `tmux`/`screen`
- c) Run the script as root
- d) Use `nice` to increase the process priority

**Answer Key:** C, C, B

## 14. Project Micro-Task

**Process Monitor Dashboard**

Write a bash script that:
1. Shows top 5 CPU-consuming processes
2. Shows top 5 memory-consuming processes
3. Shows all listening ports with their processes
4. Reports any zombie processes
5. Refreshes every 5 seconds until you press Ctrl+C

## 15. Project Progression Ladder

**Level 1:** Write a script that finds and reports all running processes owned by the current user.

**Level 2:** Build a process monitor that alerts when any process exceeds 80% CPU for more than 10 seconds.

**Level 3:** Write a "watchdog" script that monitors a service, restarts it automatically if it dies, and logs each restart.

**Level 4:** Implement a simple process supervisor (like a minimal systemd) that starts services, monitors them, restarts on failure, and provides a status command.

## 16. Knowledge Transfer

- **Kubernetes**: Pods receive `SIGTERM` before termination. `terminationGracePeriodSeconds` controls how long before `SIGKILL`. Your app must handle SIGTERM gracefully.
- **Docker**: `docker stop` sends SIGTERM. `docker kill` sends SIGKILL. Containers should handle SIGTERM to shut down cleanly.
- **Systemd services**: `systemctl stop` sends SIGTERM. Config: `TimeoutStopSec=30` before SIGKILL.
- **Python signal handling**: `import signal; signal.signal(signal.SIGTERM, handler)` — catch and handle signals in your app.

## 17. Connection Map

**Before this:** Operating Systems (processes are the OS's fundamental unit of execution)

**This enables:**
- System administration
- Docker and container management
- Service orchestration (systemd, Kubernetes)
- Debugging production incidents
- Writing robust server applications

## 18. Expert Thinking

**Beginner:** "The server is slow. Let me restart everything."
**Expert:** `top` → find process using 98% CPU → `strace -p PID` to see what it's doing → it's stuck in a `select()` call waiting for a connection that never comes → it's a bug in the connection pool → fix and deploy without restarting anything else.

## 19. Expert Insights

> "Signal handling is the difference between a server that degrades gracefully under load and one that explodes spectacularly. Handle SIGTERM. Flush your buffers. Close database connections. Then exit." — Site Reliability Engineer

- `systemd` units should include `KillSignal=SIGTERM` and `TimeoutStopSec=30` with a `ExecStop=` command that gracefully notifies the app.
- `strace -p PID` is the ultimate debugging tool. It shows every system call a process makes, letting you see exactly what it's doing when it appears stuck.

## 20. Memory Anchors

**Analogy:** Processes = employees. Signals = messages to employees. SIGTERM = "please stop when you're done." SIGKILL = "immediate evacuation, no exceptions."
**Mental image:** A process state diagram — created, ready, running, sleeping, stopped, zombie, dead.
**Key phrase:** "SIGTERM first, wait, then SIGKILL. Never skip the wait."
**Rule of thumb:** `lsof -i :PORT` to find what's using a port. `kill -0 PID` to check if a process exists.

## 21. First Principles Summary

**Three Key Ideas:**
1. Every running program is a process with a unique PID, state, and resource usage — all managed by the OS scheduler.
2. Signals are the messaging system between the OS/users and processes — SIGTERM requests graceful shutdown, SIGKILL forces immediate termination.
3. Job control (`&`, `fg`, `bg`, `jobs`) and terminal multiplexers (`tmux`) let you manage multiple processes from one terminal.

**Three Things To Remember Forever:**
1. `SIGKILL` cannot be caught or ignored. Use it as a last resort.
2. `lsof -i :3000` tells you what's using port 3000.
3. `tmux` lets your processes survive SSH disconnects.

**One-sentence definition:** Process management is the practice of viewing, controlling, and communicating with running programs using the OS's process model — including signals for control and job control for terminal-based management.

## 22. Mastery Challenge

A production web server is experiencing intermittent performance degradation:

- Response times spike to 10s every few minutes
- Memory usage grows slowly over hours (possible leak)
- Occasionally one worker process becomes unresponsive while others are fine

Design a complete diagnostic and remediation plan:
1. Which tools and commands would you use to investigate each symptom?
2. How would you identify which process is causing each problem?
3. Write a monitoring script that detects these conditions automatically.
4. How would you handle the unresponsive worker without affecting other workers?
5. How would you implement graceful restart of only the problematic component?
