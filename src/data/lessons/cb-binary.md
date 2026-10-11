# Binary & Number Systems

## 1. Why This Matters

Computers speak binary. Every image, video, string of text, and program is ultimately stored as 1s and 0s. Understanding binary unlocks: how memory addresses work, why integers overflow, how encryption operates, why colors are written as `#FF5733`, how networking masks work, and why computers are fast at certain operations and slow at others. Every senior engineer eventually hits a binary problem — and it separates those who understand what's happening from those who are guessing.

## 2. Mental Model

Humans count in **base 10** because we have 10 fingers. Each position represents a power of 10:

```
4 2 7  =  (4 × 100) + (2 × 10) + (7 × 1)
           4×10²      2×10¹     7×10⁰
```

Computers use **base 2** (binary) because transistors have two states: on (1) and off (0). Each position represents a power of 2:

```
1 0 1 1  =  (1×8) + (0×4) + (1×2) + (1×1)  =  11
            1×2³   0×2²   1×2¹   1×2⁰
```

Same idea, different base. That's all binary is.

## 3. Powerful Analogy

Binary is like **light switches in a hallway**:

- Each switch is either ON (1) or OFF (0) — no middle state
- 4 switches = 4 bits = 16 possible combinations (2⁴)
- 8 switches = 8 bits = 1 byte = 256 possible combinations (2⁸)
- You "read" the number by looking at which switches are on

A byte is like 8 light switches. The leftmost (highest power) is worth 128. The rightmost is worth 1. The total value is the sum of all switches that are ON.

## 4. Socratic Questions

- If a computer stores the number 256 in a single byte (8 bits), what happens?
- Why is computer memory measured in powers of 2 (512MB, 1024MB = 1GB)?
- Why do programmers often write colors as `#FF0000` instead of "red"?
- If `int` is 32 bits, what's the largest positive number it can hold?

## 5. Deep Explanation

### Binary (Base 2)

Each digit (bit) is 0 or 1. Positions are powers of 2:

```
Bit positions:  128  64  32  16   8   4   2   1
Binary:           1   0   1   1   0   1   0   1
Value:          128 + 0 + 32 + 16 + 0 + 4 + 0 + 1 = 181
```

**Converting decimal to binary:**
Repeatedly divide by 2, collect remainders:
```
181 ÷ 2 = 90 remainder 1   ← least significant bit
 90 ÷ 2 = 45 remainder 0
 45 ÷ 2 = 22 remainder 1
 22 ÷ 2 = 11 remainder 0
 11 ÷ 2 =  5 remainder 1
  5 ÷ 2 =  2 remainder 1
  2 ÷ 2 =  1 remainder 0
  1 ÷ 2 =  0 remainder 1   ← most significant bit

Read bottom to top: 10110101 = 181 ✓
```

### Bits and Bytes

| Unit | Size | Holds |
|---|---|---|
| Bit | 1 binary digit | 0 or 1 |
| Nibble | 4 bits | 0–15 |
| Byte | 8 bits | 0–255 |
| Kilobyte (KB) | 1,024 bytes | ~1,000 characters |
| Megabyte (MB) | 1,024 KB | ~1M characters |
| Gigabyte (GB) | 1,024 MB | ~1B characters |

Why 1,024 and not 1,000? Because 2¹⁰ = 1,024. Computers work in powers of 2.

### Hexadecimal (Base 16)

Hex uses digits 0–9 and letters A–F (A=10, B=11, ... F=15). Each hex digit = 4 bits (one nibble).

```
F    F    =  1111 1111  =  255
↑    ↑
15   15

#FF5733  (HTML color)
  FF = 255 red
  57 = 87 green
  33 = 51 blue
```

Hex is popular because it's compact (one hex digit = 4 binary digits) and maps cleanly to bytes (2 hex digits = 1 byte).

### Bitwise Operations

Bitwise operators work on individual bits:

| Operator | Symbol | Effect |
|---|---|---|
| AND | `&` | 1 only if both bits are 1 |
| OR | `\|` | 1 if either bit is 1 |
| XOR | `^` | 1 if bits are different |
| NOT | `~` | Flip all bits |
| Left shift | `<<` | Multiply by 2ⁿ |
| Right shift | `>>` | Divide by 2ⁿ |

```python
a = 0b1010  # 10
b = 0b1100  # 12

print(a & b)   # 0b1000 = 8   (AND: both must be 1)
print(a | b)   # 0b1110 = 14  (OR: either is 1)
print(a ^ b)   # 0b0110 = 6   (XOR: different bits)
print(a << 1)  # 0b10100 = 20 (left shift = ×2)
print(a >> 1)  # 0b0101 = 5   (right shift = ÷2)
```

### Integer Overflow

A 32-bit integer can hold 2³² values (0 to 4,294,967,295 unsigned, or −2,147,483,648 to 2,147,483,647 signed). If you add 1 to the maximum value, it **wraps around** to the minimum:

```
2,147,483,647 + 1 = -2,147,483,648  ← integer overflow!
```

This caused the Year 2038 problem (Unix timestamps stored in 32-bit int) and has crashed real spacecraft.

### Two's Complement (Negative Numbers)

Computers represent negative numbers using two's complement:
- Flip all bits, then add 1
- The most significant bit is the sign bit (1 = negative)

```
 5 in 8-bit binary:  00000101
-5 in two's complement:
  Step 1 (flip):     11111010
  Step 2 (+1):       11111011  = -5
```

This clever scheme means the CPU can use the same addition circuit for both positive and negative numbers.

## 6. Visual Thinking

```
BINARY PLACE VALUES (8-bit):
┌───┬───┬───┬───┬───┬───┬───┬───┐
│128│ 64│ 32│ 16│  8│  4│  2│  1│
├───┼───┼───┼───┼───┼───┼───┼───┤
│ 1 │ 0 │ 1 │ 0 │ 0 │ 1 │ 0 │ 1│
└───┴───┴───┴───┴───┴───┴───┴───┘
 128 + 0 + 32 + 0 + 0 + 4 + 0 + 1 = 165

HEX TO BINARY:
A   5   =   1010  0101   =  165
↑   ↑        ↑     ↑
10  5       A     5 in binary
```

## 7. Real Engineering Examples

**Beginner:** HTML colors. `#FF0000` = red. `FF` in hex = 255 in decimal. Max red, no green, no blue.

**Intermediate:** IP subnet masks. `255.255.255.0` = `11111111.11111111.11111111.00000000`. The 1-bits identify the network, 0-bits identify the host. Bitwise AND of IP address and mask gives the network address.

**Advanced:** Flags in a single integer. Linux file permissions (`chmod 755`) store read/write/execute bits for owner/group/other in 9 bits. Bitwise OR combines flags; AND checks them.

**Industry:** Cryptography algorithms (AES, SHA) are entirely bitwise operations — XOR, AND, rotate. Understanding binary is prerequisite to understanding security.

## 8. Code Walkthrough

```python
# Binary, hex, and bitwise operations in Python

# Representations
n = 42
print(f"Decimal:     {n}")
print(f"Binary:      {bin(n)}")     # 0b101010
print(f"Hex:         {hex(n)}")     # 0x2a
print(f"Octal:       {oct(n)}")     # 0o52

# Parsing different bases
print(int('101010', 2))   # binary string → 42
print(int('2a', 16))      # hex string → 42
print(int('52', 8))       # octal string → 42

# Bitwise operations — practical: check if number is even/odd
def is_even(n): return (n & 1) == 0   # last bit is 0 if even
def is_odd(n):  return (n & 1) == 1

print(is_even(42))  # True
print(is_odd(7))    # True

# Flags — store multiple boolean states in one int
READ    = 0b001  # 1
WRITE   = 0b010  # 2
EXECUTE = 0b100  # 4

# Grant read and write
permissions = READ | WRITE    # 0b011 = 3
print(f"Permissions: {bin(permissions)}")

# Check individual permissions
can_read    = bool(permissions & READ)     # True
can_write   = bool(permissions & WRITE)   # True
can_execute = bool(permissions & EXECUTE) # False

# Revoke write permission
permissions = permissions & ~WRITE
print(f"After revoking write: {bin(permissions)}")  # 0b001

# Count set bits (population count)
def popcount(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count

print(f"Bits set in 255: {popcount(255)}")  # 8
print(f"Bits set in 170: {popcount(170)}")  # 4 (10101010)
```

## 9. Failure Cases

**Integer overflow in production**: A game's score counter stored in `uint16` (max 65,535). Player reaches score 65,536 — wraps to 0. Fix: use larger integer types proactively.

**Signed/unsigned confusion**: Network code interprets a byte as `signed char` (-128 to 127) instead of `unsigned char` (0 to 255). Values above 127 become negative. Fix: be explicit about signedness.

**Shift by too much**: In many languages, shifting a 32-bit int by 32 or more bits is undefined behavior. Different CPUs handle it differently.

## 10. Engineering Decisions

**When to use bitwise operations?**
- Permission flags (like Linux chmod)
- Network masks
- Compression algorithms
- Graphics (pixel manipulation)
- Performance-critical tight loops

**When NOT to use bitwise tricks?**
- General business logic — unreadable and error-prone
- When a simple boolean array is clearer
- When maintainability matters more than micro-optimization

## 11. Common Misconceptions

**"Binary is for hardware engineers, not software developers"** — Wrong. Network masks, file permissions, cryptography, graphics, and optimization all require binary thinking.

**"Computers think in binary because it's natural"** — It's natural for *transistors*. Computers could theoretically use base 3 (ternary) — some experimental ones have. Binary won because transistors are reliably either on or off.

**"1 KB = 1000 bytes"** — In computing, 1 KB = 1,024 bytes (2¹⁰). In storage marketing (hard drive manufacturers), 1 KB = 1,000 bytes. This discrepancy is why a "500GB" hard drive shows as ~465GB in your OS.

## 12. Guided Practice

**Level 1:** Convert these to binary by hand: 7, 15, 100, 200. Check with `bin()`.

**Level 2:** Write a function `to_binary(n)` that converts an integer to its binary representation as a string, without using `bin()`.

**Level 3:** Implement a permission system using bitflags: READ (1), WRITE (2), EXECUTE (4), ADMIN (8). Write `grant(perms, flag)`, `revoke(perms, flag)`, and `has(perms, flag)` functions.

**Level 4:** Write a function that takes an IPv4 address and subnet mask (like `192.168.1.100` and `255.255.255.0`) and returns the network address, broadcast address, and number of usable hosts.

## 13. Quiz

**Q1.** What is `1101` in binary equal to in decimal?
- a) 11
- b) 13
- c) 14
- d) 15

**Q2.** What does the `&` (bitwise AND) operator return for `1010 & 1100`?
- a) 1110
- b) 1000
- c) 0110
- d) 1111

**Q3.** Why is `1 GB = 1,024 MB` and not `1,000 MB`?
- a) Historical accident that was never corrected
- b) 2¹⁰ = 1,024 — computer memory is addressed in powers of 2
- c) International standards require it
- d) It makes calculations easier

**Answer Key:** B, B, B

## 14. Project Micro-Task

**Binary Converter & Visualizer**

Build a Python script that:
1. Accepts a decimal number as input
2. Displays it in binary, hex, and octal
3. Shows a visual "switch" representation: `[ON ][OFF][ON ][ON ][OFF][ON ][OFF][ON ]`
4. Shows the value of each bit position
5. Handles negative numbers using two's complement

## 15. Project Progression Ladder

**Level 1:** Decimal ↔ binary ↔ hex converter.

**Level 2:** Bit manipulation library: `set_bit(n, pos)`, `clear_bit(n, pos)`, `toggle_bit(n, pos)`, `check_bit(n, pos)`.

**Level 3:** Simple image filter — load a grayscale image (as a 2D array of bytes), perform bitwise operations to create effects (invert, threshold, mask).

**Level 4:** Implement a simple checksum algorithm using XOR. Then implement a basic run-length encoding compression algorithm that operates on bytes.

## 16. Knowledge Transfer

- **Networking**: IP addresses, subnet masks, routing — all binary operations
- **Cryptography**: XOR cipher, AES rounds, hash functions — all bitwise
- **Databases**: B-tree index nodes, bitmap indexes — binary structures
- **Graphics**: RGB color channels packed into 32-bit integers, alpha blending via bitwise operations
- **Compression**: Huffman coding uses variable-length binary codes for compression

## 17. Connection Map

**Before this:** Computer Basics (computers store everything as bits)

**This enables:**
- Understanding memory addressing
- Network subnetting
- Bitwise manipulation in C and Python
- Cryptography fundamentals
- Performance optimization techniques

## 18. Expert Thinking

**Beginner:** "Why do I need this? I just use integers normally."
**Expert:** "I can store 64 feature flags for a user in a single 64-bit integer, check any flag in O(1) with a bitwise AND, and it fits in a single database column. That's 64× less storage than 64 boolean columns."

## 19. Expert Insights

> "The programmers who truly understand binary are always the ones who can diagnose the weirdest, most inexplicable bugs — the ones that only appear with specific input values near power-of-2 boundaries." — Systems programmer

- Interview tip: Binary search, power-of-2 problems, and bit manipulation are extremely common in technical interviews. Knowing `n & (n-1)` removes the lowest set bit will impress interviewers.
- Python integers have unlimited precision (no overflow). C and most other languages have fixed-width integers. Know which you're using.

## 20. Memory Anchors

**Analogy:** Binary = light switches. Each switch is ON (1) or OFF (0). Eight switches = one byte.
**Mental image:** The place value table — 128, 64, 32, 16, 8, 4, 2, 1.
**Key phrase:** "Computers speak binary because transistors have two states."
**Rule of thumb:** Every power of 2 is just a 1 followed by zeros in binary. 2⁸ = 100000000.

## 21. First Principles Summary

**Three Key Ideas:**
1. Binary is base 2 — same as decimal but with powers of 2 instead of powers of 10.
2. Every piece of data (text, images, programs) is ultimately stored as binary.
3. Bitwise operations let you manipulate individual bits efficiently — used everywhere from permissions to cryptography.

**Three Things To Remember Forever:**
1. 8 bits = 1 byte = 256 values (0–255)
2. Hexadecimal is a shorthand for binary: 1 hex digit = 4 bits
3. Integer overflow is real — know the limits of your data types

**One-sentence definition:** Binary is the base-2 number system where every value is expressed using only 0s and 1s, and every piece of digital information ultimately reduces to this representation.

## 22. Mastery Challenge

You're designing a user permission system for a platform with 16 possible permissions (read, write, delete, admin, export, import, comment, share, etc.).

1. Design a bitflag system that stores all permissions in a single 16-bit integer.
2. Write functions to: grant a permission, revoke a permission, check a permission, and list all granted permissions.
3. Show how to grant "read AND write but NOT delete" in a single line.
4. A user has permissions `0b1010110101101101`. List which permissions they have (by position).
5. How many bytes does storing permissions for 1 million users require with your system vs. a 16-column boolean table?
