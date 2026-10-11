# Permissions & Users

## 1. Why This Matters

Linux permissions are the security model that keeps servers safe. Misconfigured permissions cause real breaches — a world-readable private key, an executable that any user can modify, a directory that attackers can write to. Understanding permissions is required for deploying apps, managing servers, securing APIs, and writing safe scripts. Every professional engineer is expected to understand `chmod`, `chown`, and `sudo`.

## 2. Mental Model

Linux permissions work like **key access in an office building**:

- Every file/directory is a room with a combination lock
- The lock has three dials: **owner**, **group**, **everyone else**
- Each dial has three settings: **read**, **write**, **execute**
- The building security guard (`sudo`) can override any lock

## 3. Powerful Analogy

File permissions are like **a shared apartment**:

- The owner (you) can do anything in your room — read, write, execute
- Your flatmates (group) might be allowed to read your files but not modify them
- Random strangers (others) can only see files you've explicitly made public
- The landlord (root/sudo) has a master key to everything

## 4. Socratic Questions

- Why would you ever make a file executable for "others" on a server?
- What would happen if the `/etc/passwd` file was writable by all users?
- Why does a web server typically run as its own user (`www-data`) and not `root`?
- What's the risk of running everything as `root`?

## 5. Deep Explanation

### Users and Groups

Every Linux system has:
- **Users**: Accounts that own files and run processes (`william`, `www-data`, `postgres`)
- **Groups**: Collections of users (`developers`, `staff`, `docker`)
- **root**: The superuser — can do anything, bypasses all permission checks

```bash
whoami          # current user
id              # your UID, GID, and all groups
groups          # groups you belong to
cat /etc/passwd # all user accounts
cat /etc/group  # all groups
```

### Reading Permissions

```bash
ls -la

# drwxr-xr-x  2 william  staff   64 Jun 1 09:00 projects/
# -rw-r--r--  1 william  staff 2048 Jun 1 09:30 notes.txt
# -rwxr-x---  1 william  docker 512 Jun 1 10:00 deploy.sh

# Breaking down: -rw-r--r--
# Position:  [type][owner][group][others]
#             -     rw-    r--    r--

# Type characters:
# -  = regular file
# d  = directory
# l  = symbolic link
# b  = block device

# Permission characters (each 3-bit set):
# r = read    (4)
# w = write   (2)
# x = execute (1)
# - = no permission (0)
```

### Permission Breakdown

| Symbol | File | Directory |
|---|---|---|
| `r` (read) | Read file contents | List directory contents |
| `w` (write) | Modify file contents | Create/delete files in directory |
| `x` (execute) | Run as program | Enter the directory (`cd`) |

**Critical insight**: To access a file inside a directory, you need **execute** permission on the directory, not just read. `r` alone lets you see the filenames. `x` lets you enter and access files.

### Octal Permissions (Numbers)

```
r=4, w=2, x=1

rwx = 4+2+1 = 7
rw- = 4+2+0 = 6
r-x = 4+0+1 = 5
r-- = 4+0+0 = 4
--- = 0+0+0 = 0

chmod 755 = rwxr-xr-x
chmod 644 = rw-r--r--
chmod 600 = rw-------
chmod 777 = rwxrwxrwx (DANGER — everyone can do everything)
```

**Common permission patterns:**

| Octal | Symbolic | Use case |
|---|---|---|
| `600` | rw------- | Private key files (SSH keys!) |
| `644` | rw-r--r-- | Regular files, configs |
| `700` | rwx------ | Private scripts |
| `755` | rwxr-xr-x | Programs, public directories |
| `777` | rwxrwxrwx | AVOID — world-writable |

### chmod — Change Permissions

```bash
# Numeric mode
chmod 755 script.sh          # rwxr-xr-x
chmod 644 config.json        # rw-r--r--
chmod 600 ~/.ssh/id_rsa      # rw------- (SSH key must be this)

# Symbolic mode
chmod +x script.sh           # add execute for all
chmod u+x script.sh          # add execute for owner only
chmod g-w shared.txt         # remove group write
chmod o-rwx private.txt      # remove all perms for others
chmod a+r public.txt         # add read for all (a = all)

# Recursive
chmod -R 755 /var/www/html/  # set recursively for directory
```

### chown — Change Ownership

```bash
chown william file.txt             # change owner
chown william:staff file.txt       # change owner and group
chown -R www-data /var/www/html/   # recursive ownership change
chgrp developers project/          # change group only
```

### sudo — Superuser Commands

```bash
sudo command          # run command as root
sudo -u postgres psql # run as specific user
sudo -s               # open root shell (dangerous!)
sudo !!               # re-run last command as sudo

# Edit sudoers (who can use sudo and for what)
sudo visudo

# Common sudoers patterns:
william ALL=(ALL) ALL              # william can run anything as root
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx  # passwordless restart
```

### Special Permissions

**Setuid (SUID)**: Program runs as its owner, not the caller.
```bash
chmod u+s /usr/bin/passwd   # passwd runs as root so it can modify /etc/shadow
ls -la /usr/bin/passwd
# -rwsr-xr-x root root passwd    ← 's' instead of 'x' = setuid
```

**Sticky bit**: On directories — only owner can delete their own files.
```bash
chmod +t /tmp          # /tmp is world-writable but sticky
ls -la /
# drwxrwxrwt root root tmp/    ← 't' = sticky bit
```

## 6. Visual Thinking

```
FILE PERMISSION DIAGRAM:

-  r  w  -  |  r  -  -  |  r  -  -
│  │  │  │    │  │  │     │  │  │
│  └──┴──┘    └──┴──┘     └──┴──┘
│   owner      group       others
└─ type (- file, d dir, l link)

EXAMPLE: -rw-r--r-- on notes.txt

Owner (william):  can READ ✓  can WRITE ✓  cannot EXECUTE ✗
Group (staff):    can READ ✓  cannot WRITE ✗  cannot EXECUTE ✗
Others:           can READ ✓  cannot WRITE ✗  cannot EXECUTE ✗
```

## 7. Real Engineering Examples

**Beginner:** `chmod +x deploy.sh` — makes a script executable so you can run it with `./deploy.sh`.

**Intermediate:** Web server (`www-data` user) needs to read uploaded files but not write to source code: `chown -R www-data:developers /var/www && chmod -R 750 /var/www`.

**Advanced:** SSH login fails with "permissions too open" error. SSH requires private key to be `600` (owner-only): `chmod 600 ~/.ssh/id_rsa`.

**Industry:** A container runs as non-root user (principle of least privilege). If the container is compromised, the attacker has limited access to the host system.

## 8. Code Walkthrough

```bash
#!/bin/bash
# permissions-demo.sh — understanding permissions practically

echo "=== CURRENT USER ==="
echo "User:   $(whoami)"
echo "ID:     $(id)"
echo "Groups: $(groups)"

echo ""
echo "=== CREATE TEST FILES ==="
mkdir -p /tmp/perms-demo
cd /tmp/perms-demo

# Create files with different permissions
echo "secret data" > private.txt
echo "public data" > public.txt
echo '#!/bin/bash
echo "Script is running!"' > script.sh

# Set permissions
chmod 600 private.txt   # owner read/write only
chmod 644 public.txt    # owner rw, others read
chmod 755 script.sh     # owner all, others read/execute

echo ""
echo "=== PERMISSION LISTING ==="
ls -la

echo ""
echo "=== PERMISSION BREAKDOWN ==="
for file in private.txt public.txt script.sh; do
    perms=$(stat -c "%a %U %G %n" "$file" 2>/dev/null || stat -f "%Lp %Su %Sg %N" "$file")
    echo "$file: $perms"
done

echo ""
echo "=== RUN THE SCRIPT ==="
./script.sh

echo ""
echo "=== REMOVE EXECUTE PERMISSION ==="
chmod -x script.sh
echo "After chmod -x:"
ls -la script.sh
echo "Trying to run..."
./script.sh 2>&1 || echo "Permission denied! (expected)"

echo ""
echo "=== CLEANUP ==="
cd ~
rm -rf /tmp/perms-demo
echo "Done."
```

## 9. Failure Cases

**World-writable config**: `chmod 777 /etc/app/config.json` — any user or compromised process can overwrite your config. A common vector for privilege escalation attacks.

**SSH key too permissive**: SSH client refuses to use a private key with permissions wider than `600`. Error: "WARNING: UNPROTECTED PRIVATE KEY FILE!"

**www-data writing to source code**: Web server process infected by malware rewrites PHP files. Fix: source code should be owned by a deploy user, readable by `www-data`, but not writable.

**sudo misconfiguration**: Adding a user to the `sudo` group without `NOPASSWD` restriction in CI/CD means deployments require a password — scripts hang indefinitely.

## 10. Engineering Decisions

**Run web server as root?**
- Never. If the web server is compromised, root access means total system compromise.
- Run as `www-data` or a dedicated `appuser` with minimal permissions.
- Use `setcap cap_net_bind_service=+ep` to let a non-root process bind to port 80.

**When to use `sudo`?**
- Only for operations that genuinely need root: installing packages, editing `/etc`, managing services.
- Script running in production: use a service account with only the specific permissions needed.

## 11. Common Misconceptions

**"777 is fine for development"** — Bad habit that becomes a security disaster in production. Use correct permissions from day one.

**"Root is just another user"** — Root bypasses all permission checks. A compromised root process can read any file, kill any process, install anything. Treat root access as critical infrastructure.

**"Permissions protect against everything"** — Permissions protect against unauthorized access by the OS. They don't protect against: bugs in programs (buffer overflows), social engineering, or attackers who already have legitimate access.

## 12. Guided Practice

**Level 1:** Check the permissions on your `~/.ssh/` directory and files. Are they correct? (`~/.ssh` should be `700`, private keys `600`).

**Level 2:** Create a directory `shared/` where all members of a group can read and write files. Set it up so files created in it inherit the group ownership.

**Level 3:** Write a bash script that audits a directory for security issues: world-writable files, SUID binaries, and files owned by root in unexpected locations.

**Level 4:** Set up a web server (nginx or Python's http.server) running as a non-root user. Configure permissions so it can read its web root but not write to it.

## 13. Quiz

**Q1.** What permissions does `chmod 755` set?
- a) rw-rw-rw-
- b) rwxr-xr-x
- c) rwxrwxrwx
- d) rw-r--r--

**Q2.** Your script fails with "Permission denied" when you run `./myscript.sh`. What's the most likely fix?
- a) `chown root myscript.sh`
- b) `chmod +x myscript.sh`
- c) `sudo myscript.sh`
- d) `chmod 777 myscript.sh`

**Q3.** Why should SSH private keys have permission `600` (rw-------)?
- a) SSH requires this format for encryption
- b) To prevent other users from reading your private key
- c) To allow the SSH server to access your key
- d) For performance reasons

**Answer Key:** B, B, B

## 14. Project Micro-Task

**Security Permissions Audit**

Write a bash script that audits a directory and reports:
1. World-writable files (`-perm -o+w`)
2. SUID/SGID files (`-perm /6000`)
3. Files owned by root but in user home directories
4. Unprotected configuration files (readable by all)
5. Outputs a security report with recommendations

## 15. Project Progression Ladder

**Level 1:** Correctly set permissions on a set of files for a specific scenario.

**Level 2:** Write a script that sets up a deployment directory with correct permissions for a web app.

**Level 3:** Build a permission audit tool that checks against a security policy.

**Level 4:** Create a minimal privilege setup for a web application: separate users for web server, app, and database with exactly the permissions each needs.

## 16. Knowledge Transfer

- **Docker**: Container images run as root by default. Production containers should use `USER appuser` instruction. Same permission principles.
- **SSH**: Private keys must be `600`. `~/.ssh/authorized_keys` must be `600`. The SSH directory must be `700`. Permissions are enforced by SSH itself.
- **Databases**: PostgreSQL's data directory must be owned by the `postgres` user with `700` permissions. Any other setting prevents startup.
- **Git repos**: Bare repositories on servers use group permissions (`chmod g+s`) so multiple team members can push.

## 17. Connection Map

**Before this:** File Operations (files have permissions that affect operations)

**This enables:**
- Secure server administration
- SSH configuration
- Docker security
- Web server setup
- Writing deployment scripts safely

## 18. Expert Thinking

**Beginner:** "I'll just `chmod 777` everything so nothing breaks."
**Expert:** "Each component gets exactly the permissions it needs. Web server reads but can't write source code. App user owns app files. Database user owns only the data directory. If any component is compromised, blast radius is minimal."

## 19. Expert Insights

> "The principle of least privilege is the most important security concept you'll ever learn. Give every process, user, and service only the minimum permissions it needs to function. Nothing more." — Security engineer at a fintech company

- On production servers, audit permissions quarterly: `find / -perm -o+w -type f 2>/dev/null` finds all world-writable files.
- `umask` controls default permissions for new files. `umask 022` means new files are `644` by default, directories `755`.

## 20. Memory Anchors

**Analogy:** Permissions = apartment access. Owner = you. Group = flatmates. Others = strangers. Root = landlord.
**Mental image:** Three groups, each with three toggles: r-w-x. The 9-character permission string.
**Key phrase:** "Principle of least privilege — only what's needed, nothing more."
**Rule of thumb:** Private keys = `600`. Scripts = `755`. Data files = `644`. Never `777`.

## 21. First Principles Summary

**Three Key Ideas:**
1. Every file has three permission sets (owner, group, others) each controlling read, write, and execute access.
2. Running processes as non-root users limits the damage when things go wrong.
3. Permissions are the first line of defense — the principle of least privilege reduces attack surface.

**Three Things To Remember Forever:**
1. `chmod 600` for private keys, `chmod 755` for executables, `chmod 644` for data.
2. Never run production services as root.
3. `sudo` = root power. Use sparingly. Audit what you're giving it to.

**One-sentence definition:** Linux permissions are a three-level (owner/group/others) access control system where each level independently controls read, write, and execute access to every file and directory.

## 22. Mastery Challenge

You're setting up a production web application with:
- A web server (nginx) serving static files and proxying to an app
- A Python web app running as `appuser`
- A PostgreSQL database running as `postgres`
- Deployment scripts that run as `deploy` user

Design the complete permission setup:
1. What users and groups do you create?
2. What are the permissions on the app directory, static files, logs, and config files?
3. What `sudoers` rules are needed for deployment without root shell?
4. How do you ensure the web server can read static files but can't modify the app?
5. Demonstrate the setup with actual `useradd`, `chmod`, `chown`, and `visudo` commands.
