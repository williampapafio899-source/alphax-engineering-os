# Files & File Systems

## 1. Why This Matters

Files are the universal unit of persistence. Your code, databases, configs, logs, images — everything lives in a file system. Understanding how files are stored, organized, and accessed explains why databases exist, why copying large files is slow, why SSDs feel faster, and how git tracks changes. Every engineer works with files daily. Most engineers never think about how they actually work.

## 2. Mental Model

A file system is a **library's cataloguing system**:

- The library building = the storage device (SSD/HDD)
- Each book = a file (the actual data)
- The catalogue = the file system metadata (names, locations, sizes)
- The Dewey Decimal System = the directory structure
- The librarian = the OS file system driver

When you open a file, the OS consults the catalogue, finds the physical location of the data on disk, and fetches it for you.

## 3. Powerful Analogy

Think of a file system as a **city with an address system**:

- Streets and buildings = directories and files
- Street addresses = file paths (`/home/user/documents/report.txt`)
- The city map = the directory tree
- A postal service = the OS reading data at those addresses
- Demolishing a building = deleting a file (the address is freed, the land reused)

Important: When you "delete" a file, you're not erasing the data immediately — you're removing it from the city map. The land (disk space) is just marked as available for reuse. This is why deleted files can be recovered.

## 4. Socratic Questions

- If you rename a file, does the data on disk move?
- Why does deleting a 10GB file happen instantly, but copying it takes minutes?
- What's the difference between a file's name and the file itself?
- Why can two different paths point to the same file?

## 5. Deep Explanation

### How Files Are Stored

Storage devices store data in fixed-size blocks (typically 512 bytes or 4KB). A file occupies one or more of these blocks. The file system keeps track of:

1. **Which blocks belong to which file**
2. **File metadata** (name, size, permissions, timestamps)
3. **Directory structure** (which files are in which folder)

### Inodes (Linux/Mac)

In Unix-based systems, every file has an **inode** — a data structure storing:
- File size
- Owner and permissions
- Timestamps (created, modified, accessed)
- Pointers to the data blocks on disk

The **filename is NOT stored in the inode**. Filenames live in directories. A directory is just a file that maps names to inode numbers.

```
Directory entry:  "report.txt" ──▶ inode #4821
                                        │
                              ┌─────────▼──────────┐
                              │ inode #4821         │
                              │ size: 2048 bytes    │
                              │ permissions: rw-r-- │
                              │ blocks: [104, 105]  │
                              └────────────────────-┘
                                    │         │
                              block 104    block 105
                              (data)       (data)
```

### File Paths

**Absolute path**: Starts from root. `/home/william/projects/app.py`
**Relative path**: Starts from current directory. `./app.py` or `../config.json`

**Special directories:**
- `.` = current directory
- `..` = parent directory
- `~` = home directory (`/home/username`)

### File System Types

| File System | OS | Features |
|---|---|---|
| ext4 | Linux | Default Linux FS, journaling |
| NTFS | Windows | Permissions, large files, journaling |
| APFS | macOS | Snapshots, encryption, optimized for SSD |
| FAT32 | All | Universal, max 4GB file size |
| ZFS | Linux/BSD | Snapshots, checksums, RAID |

### Directories

A directory is a special file that contains a list of entries: each entry is a (name, inode) pair. When you create a folder, you create a new inode and a new directory file.

### Hard Links and Symbolic Links

**Hard link**: A second directory entry pointing to the same inode. Two names, one file. The file is only truly deleted when ALL hard links are removed.

```bash
ln original.txt hardlink.txt      # both point to same inode
```

**Symbolic link (symlink)**: A file that contains a path to another file. Like a shortcut.

```bash
ln -s /usr/local/python3.11 python   # symlink
```

### Mounting

In Unix, all storage devices are attached to the single directory tree via **mounting**. A USB drive might be mounted at `/media/usb`. The OS merges it into the tree seamlessly.

```
/
├── home/
├── etc/
├── media/
│   └── usb/     ◀── your USB drive is here
└── var/
```

## 6. Visual Thinking

```
/  (root)
├── bin/       system binaries
├── etc/       configuration files
├── home/
│   └── william/
│       ├── projects/
│       │   ├── app.py
│       │   └── README.md
│       └── .bashrc    ← hidden file (starts with .)
├── tmp/       temporary files (cleared on reboot)
├── usr/       user programs and libraries
└── var/
    └── log/   ← log files live here
```

This is the Unix directory tree. Every Linux and macOS system has exactly this structure. Windows uses `C:\` as root and `\` as separator instead of `/`.

## 7. Real Engineering Examples

**Beginner:** You run `rm important.txt` by mistake. The data isn't gone yet — recovery tools can find it because the blocks haven't been overwritten.

**Intermediate:** Your server's `/var/log` fills up completely. The entire system stops accepting connections because no process can write to disk. Fix: log rotation, monitoring disk usage.

**Advanced:** A database stores its data files in a directory. The file system's block size affects I/O efficiency. DBAs tune file system parameters for database workloads.

**Industry:** Git uses the file system to store every version of every file ever committed. Each commit is a snapshot of the directory tree, stored efficiently using content-addressable storage.

## 8. Code Walkthrough

```python
import os
import stat
import time
from pathlib import Path

# Modern Python file operations using pathlib
file = Path("example.txt")

# Create and write
file.write_text("Hello, file system!\nSecond line.")
print(f"Created: {file.absolute()}")

# Read it back
content = file.read_text()
print(f"Content: {repr(content)}")

# File metadata
info = file.stat()
print(f"\nSize:         {info.st_size} bytes")
print(f"Inode:        {info.st_ino}")
print(f"Modified:     {time.ctime(info.st_mtime)}")
print(f"Permissions:  {oct(info.st_mode)}")

# Directory operations
projects = Path("my_projects")
projects.mkdir(exist_ok=True)
(projects / "app.py").write_text("# My app")
(projects / "README.md").write_text("# Project")

# List directory contents
print("\nDirectory contents:")
for item in projects.iterdir():
    size = item.stat().st_size
    print(f"  {'DIR' if item.is_dir() else 'FILE'} {item.name:20} {size} bytes")

# Walk directory tree recursively
print("\nRecursive walk:")
for path in projects.rglob("*"):
    depth = len(path.relative_to(projects).parts)
    print(f"  {'  ' * depth}{path.name}")

# Cleanup
import shutil
shutil.rmtree(projects)
file.unlink()
print("\nCleaned up.")
```

**Key points:**
- `Path` is the modern way — works on Windows and Unix without string hacks
- `stat()` returns inode information including the inode number
- `rglob("*")` walks the entire directory tree recursively

## 9. Failure Cases

**Disk full crash**: Server fills up `/var/log`. Linux can't write any new files. Processes that try to log crash. Fix: monitor disk usage, set up log rotation (`logrotate`).

**Symlink hell**: A symlink points to a relative path that no longer exists. Every tool that follows the link fails mysteriously. Fix: use absolute paths in symlinks for system-critical links.

**Inode exhaustion**: A disk can run out of inodes (metadata slots) before running out of space. Creating millions of tiny files consumes inodes. `df -i` shows inode usage. Fix: combine small files or reformat with more inodes.

**Encoding issues**: A file named `résumé.pdf` on macOS may not display correctly on Windows due to different Unicode normalization forms (NFC vs. NFD). Fix: stick to ASCII for filenames in shared environments.

## 10. Engineering Decisions

**Where to store application data?**
- Config: `/etc/myapp/` (system) or `~/.config/myapp/` (user)
- Logs: `/var/log/myapp/`
- Temporary files: `/tmp/` (auto-cleared) or `tempfile` module
- User data: a database, not flat files (for structured data at scale)

**Flat files vs. database?**
- Flat files: Great for config, logs, simple key-value storage
- Database: Required when you need querying, concurrent writes, transactions, or > ~10,000 records

## 11. Common Misconceptions

**"Deleting a file removes the data"** — No. It removes the directory entry. Data blocks are marked as free but not zeroed. This is why secure deletion tools exist.

**"Files are named in the inode"** — No. The inode has no name. Names exist only in directory entries. A file can have multiple names (hard links) or no accessible name (unlinked but still open).

**"Copying is slow because the OS has to think"** — No. Copying reads every byte from one location and writes it to another. It's slow because moving large amounts of data through the I/O bus takes time.

## 12. Guided Practice

**Level 1:** Find the size of 5 files in your home directory using Python's `pathlib`. Display them sorted by size.

**Level 2:** Write a function that recursively calculates the total size of a directory (like `du -sh`).

**Level 3:** Write a duplicate file finder — scan a directory, group files by size, then compare file contents to find exact duplicates.

**Level 4:** Build a simple file watcher that detects when files in a directory are created, modified, or deleted and prints a log message.

## 13. Quiz

**Q1.** You rename a file in the same directory. What happens at the file system level?
- a) Data is copied to a new location with the new name
- b) Only the directory entry (name) changes — the inode and data blocks stay the same
- c) A new inode is created
- d) The file is deleted and recreated

**Q2.** Your disk shows 0 bytes free but you delete a 10GB file. Disk space doesn't change. Why?
- a) The OS has a bug
- b) Another process still has the file open — the inode won't be freed until it closes it
- c) The file was compressed
- d) You need to restart to refresh disk stats

**Q3.** What is the difference between a hard link and a symlink?
- a) Hard links work on directories; symlinks work on files
- b) Hard links point directly to the inode; symlinks store a path
- c) Hard links are slower; symlinks are faster
- d) Hard links work across filesystems; symlinks don't

**Answer Key:** B, B, B

## 14. Project Micro-Task

**Disk Usage Analyzer**

Build a script that:
1. Takes a directory path as argument
2. Recursively calculates size of each subdirectory
3. Displays a sorted list: biggest directories first
4. Shows a percentage bar for each: `projects/ [████████░░] 83% (2.1 GB)`

**Success criteria:** Handles nested directories, shows accurate sizes, has a readable output.

## 15. Project Progression Ladder

**Level 1:** List all files in a directory with their sizes.

**Level 2:** Recursive total size calculator with depth control.

**Level 3:** Find duplicate files, oldest files, and largest files across an entire directory tree.

**Level 4:** File sync tool — given two directories, identify files that are new, modified, or deleted in one versus the other. Output a "diff" of the directories.

## 16. Knowledge Transfer

- **Git**: Stores files as content-addressed blobs. The same content has the same hash regardless of filename. This is the same principle as deduplicating file storage.
- **Databases**: A database file (`.db`, `.mdf`) is just a file containing structured binary data. The database engine manages internal structure within that file.
- **Docker**: Container images are layers of file system changes. Each layer is a diff of files added, modified, or removed.
- **S3/Cloud storage**: Object storage — no directories, just keys (paths) and values (file contents). Same concept, no hierarchy.

## 17. Connection Map

**Before this:** Operating Systems (the OS manages file systems)

**This enables:**
- Linux terminal commands (`ls`, `cd`, `cp`, `mv`, `find`)
- Git (stores everything as files)
- Database storage engines
- Docker layers
- Backup and recovery systems

## 18. Expert Thinking

**Beginner:** "I'll just save everything to one big folder."
**Expert:** "I need a directory structure that scales to millions of files, uses content-addressable storage for deduplication, and separates hot data (frequently accessed) from cold data (archives) for storage tiering."

## 19. Expert Insights

> "The moment I understood that a filename is just a pointer in a directory, not part of the file itself, everything about Unix made sense." — Linux kernel contributor

- `lsof` (List Open Files) is one of the most useful debugging commands on Linux. It shows every file every process has open.
- Log rotation is something every production server needs. Set it up before your disk fills up, not after.
- Content-addressable storage (used by Git, Bittorrent, IPFS) is built entirely on the insight that file identity should be based on content hash, not path.

## 20. Memory Anchors

**Analogy:** File system = city with address system. Files are buildings, paths are addresses, inode = the building itself.
**Mental image:** The Unix directory tree — one `/` at the top, everything branching down.
**Key phrase:** "The name is not the file. The inode is the file."
**Rule of thumb:** Deleting = removing the address. The building stands until the land is reused.

## 21. First Principles Summary

**Three Key Ideas:**
1. Files are data blocks on disk. File names are directory entries pointing to inodes.
2. The file system's job is to map human-readable paths to physical disk locations.
3. "Deleting" a file just removes the name — the data persists until overwritten.

**Three Things To Remember Forever:**
1. Inodes hold file metadata, not file names.
2. Moving a file in the same filesystem is instant (just renames the directory entry).
3. Disk full errors are catastrophic — monitor disk usage proactively.

**One-sentence definition:** A file system is the data structure and software that organizes, names, and tracks the location of data stored on a physical device.

## 22. Mastery Challenge

You're building a file-based cache system for a web application that:
- Stores up to 1 million cached response files
- Files are named by MD5 hash of the request URL
- Files must expire after 24 hours
- System must handle concurrent reads/writes

Questions:
1. What directory structure would you use? (Flat vs. nested — what's the inode limit concern?)
2. How do you implement expiry without a separate cleanup daemon?
3. What happens under concurrent writes to the same key?
4. How would you monitor the cache's disk usage?
5. Implement the core `get(key)` and `set(key, value, ttl)` functions in Python.
