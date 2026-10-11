# How Networks Work

## 1. Why This Matters

Every web app you build sends and receives data over a network. Every API call, database connection, and file upload travels through layers of networking infrastructure. When your app goes down at 2am, the problem is often network-related. When your API is slow, the bottleneck might be network latency. Understanding networking means you can build faster apps, debug production issues, and design systems that work at global scale.

## 2. Mental Model

A network is a **postal system for data**:

- Your computer = a house with an address (IP address)
- Data = letters broken into pieces (packets)
- The internet = a global network of post offices (routers)
- Each router = a post office that knows which direction to send mail
- The protocol = the rules for addressing envelopes (TCP/IP)

Data doesn't travel as one big block — it's broken into **packets**, each labeled with source and destination addresses, routed independently through the network, and reassembled at the destination.

## 3. Powerful Analogy

The internet is like a **highway system**:

- Your data = a shipment split across many trucks (packets)
- Trucks don't all take the same route — they take the fastest available road
- Traffic lights and signs = routing protocols
- Highway interchanges = routers
- Your destination = the server

Some trucks might arrive out of order. TCP's job is to wait for all trucks and reassemble them in the right order. UDP's job is to just take the trucks that arrive and not wait for the rest.

## 4. Socratic Questions

- Why does "the internet" still work when individual cables are cut?
- Why does your computer need both an IP address and a MAC address?
- When you visit `google.com`, how does your computer know which IP address that is?
- Why does video call quality degrade when packets are lost, but file downloads just slow down?

## 5. Deep Explanation

### The OSI Model — Layers of Networking

Networking is organized in layers. Each layer handles one job and uses the layer below it.

```
7  Application  HTTP, FTP, SMTP, DNS    ← what your app uses
6  Presentation SSL/TLS, encoding
5  Session      Connection management
4  Transport    TCP, UDP                ← port numbers, reliability
3  Network      IP, routing             ← IP addresses, routing
2  Data Link    Ethernet, WiFi, MAC     ← physical addresses
1  Physical     Cables, radio waves     ← actual bits on wire
```

In practice, engineers mostly think about 4 layers:
- **Application** (HTTP, DNS, SMTP)
- **Transport** (TCP, UDP)
- **Internet** (IP)
- **Network Access** (Ethernet, WiFi)

### IP Addresses

Every device on a network has an IP address — a unique identifier.

**IPv4**: 4 bytes, written as dotted decimal: `192.168.1.100`
- ~4.3 billion possible addresses (running out — hence IPv6)
- Private ranges: `10.x.x.x`, `172.16–31.x.x`, `192.168.x.x` (your home network)

**IPv6**: 16 bytes, written in hex: `2001:0db8:85a3::8a2e:0370:7334`
- 340 undecillion addresses (effectively infinite)

**Special addresses:**
- `127.0.0.1` = localhost (your own machine)
- `0.0.0.0` = bind to all interfaces
- `255.255.255.255` = broadcast

### Packets

Data is broken into packets (typically 1,500 bytes each). Each packet contains:
- **Header**: source IP, destination IP, protocol, sequence number
- **Payload**: the actual data

Packets travel independently through the network. Different packets from the same message may take different routes.

### TCP vs UDP

| | TCP | UDP |
|---|---|---|
| Connection | Yes (handshake first) | No (fire and forget) |
| Reliability | Guaranteed delivery, in order | No guarantee |
| Speed | Slower (acknowledgements) | Faster |
| Use case | HTTP, email, file transfer | Video streaming, DNS, gaming |
| Analogy | Certified mail | Flyer dropped from a plane |

**TCP 3-way handshake:**
```
Client ──SYN──────────────▶ Server
Client ◀──SYN-ACK────────── Server
Client ──ACK──────────────▶ Server
[Connection established]
```

### Ports

IP addresses identify machines. Ports identify services on those machines.

```
192.168.1.100 : 80    ← HTTP server
192.168.1.100 : 443   ← HTTPS server
192.168.1.100 : 22    ← SSH server
192.168.1.100 : 5432  ← PostgreSQL database
```

**Well-known ports:**
- 80 = HTTP
- 443 = HTTPS
- 22 = SSH
- 25 = SMTP (email)
- 53 = DNS
- 3306 = MySQL
- 5432 = PostgreSQL

### Routers and Routing

A router is a device that forwards packets between networks. Every router has a **routing table** — a map of which network interface to use for which destination IP range.

When a packet arrives, the router looks up the destination in its routing table and forwards it to the next hop. This continues until the packet reaches its destination. This process is called **hop-by-hop routing**.

```
Your PC ──▶ Home Router ──▶ ISP Router ──▶ ... ──▶ Server
```

### NAT (Network Address Translation)

Your home network uses private IPs (192.168.x.x) that aren't routable on the public internet. Your router uses NAT to translate between your private IP and your router's public IP.

```
192.168.1.100:52341  ──NAT──▶  203.0.113.5:52341  ──▶  Internet
(private)                      (public)
```

## 6. Visual Thinking

```
DATA JOURNEY: Your Browser → Google

[Your Browser]
     │ HTTP request
     ▼
[TCP layer: add port 443, sequence numbers]
     │
     ▼
[IP layer: add source IP 192.168.1.5, dest 142.250.80.46]
     │
     ▼
[Ethernet: add MAC addresses, send to gateway]
     │
     ▼
[Home Router: NAT, forward to ISP]
     │
[multiple hops through internet infrastructure]
     │
     ▼
[Google's Server: unwrap layers, process HTTP]
     │
     ▼
[Response travels back the same way in reverse]
```

## 7. Real Engineering Examples

**Beginner:** `ping google.com` — sends ICMP packets and measures round-trip time (latency).

**Intermediate:** A web API times out after 30 seconds. The server is up but a firewall rule is dropping packets silently. `traceroute` shows where packets stop.

**Advanced:** A global app serves users from 3 data centers. Anycast routing directs each user to the nearest datacenter automatically using BGP.

**Industry:** Content Delivery Networks (CDNs like Cloudflare) cache content at hundreds of locations worldwide. Your video loads from a server 10ms away, not one 200ms away.

## 8. Code Walkthrough

```python
import socket
import struct
import time

# Basic TCP connection
def http_request(host, path="/"):
    """Make a raw HTTP request using only sockets"""
    
    # DNS lookup — converts hostname to IP
    ip = socket.gethostbyname(host)
    print(f"Resolved {host} → {ip}")
    
    # Create a TCP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    
    # Connect (TCP 3-way handshake happens here)
    start = time.time()
    sock.connect((ip, 80))
    connect_time = (time.time() - start) * 1000
    print(f"TCP connected in {connect_time:.1f}ms")
    
    # Send HTTP request
    request = f"GET {path} HTTP/1.0\r\nHost: {host}\r\n\r\n"
    sock.send(request.encode())
    
    # Receive response
    response = b""
    while True:
        chunk = sock.recv(4096)
        if not chunk: break
        response += chunk
    
    sock.close()
    
    # Parse status line
    first_line = response.split(b"\r\n")[0].decode()
    print(f"Response: {first_line}")
    return response

# Check which ports are open on localhost
def scan_ports(host, ports):
    print(f"\nPort scan of {host}:")
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)
        result = sock.connect_ex((host, port))
        status = "OPEN  ✓" if result == 0 else "closed"
        print(f"  Port {port:5}: {status}")
        sock.close()

# Get your machine's network info
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)
print(f"Hostname: {hostname}")
print(f"Local IP: {local_ip}")

scan_ports("localhost", [22, 80, 443, 3000, 5432, 8080])
```

## 9. Failure Cases

**Packet loss**: Network congestion drops packets. TCP retransmits them (slow). UDP just loses them (video glitches).

**DNS failure**: The server is up but DNS is down. App can't resolve hostname. Looks like the server is down. Fix: `ping <IP directly>` bypasses DNS.

**Port exhaustion**: A server makes too many outgoing connections, exhausts the ~60,000 available ephemeral ports. New connections fail. Fix: connection pooling, keep-alive.

**Split-brain**: Network partition splits a cluster. Each half thinks the other is dead and elects a new leader. Now two nodes think they're master. Data corruption follows.

## 10. Engineering Decisions

**TCP vs UDP for your app?**
- Most web APIs: TCP (HTTP/HTTPS)
- Real-time games: UDP (low latency > reliability)
- Video streaming: UDP or QUIC (slight glitches OK, latency matters)
- File transfer: TCP (every byte must arrive correctly)

**IPv4 vs IPv6?**
- Support both when possible. IPv6 adoption is growing but IPv4 still dominates.
- Use dual-stack servers that listen on both.

## 11. Common Misconceptions

**"The internet is one big network"** — It's a network of networks. Thousands of ISPs, data centers, and companies each run their own networks, connected via BGP peering agreements.

**"Higher bandwidth = faster internet"** — Latency (delay) often matters more than bandwidth. A 1 Gbps connection with 300ms latency feels slower than 100 Mbps with 5ms latency for interactive apps.

**"Packets always take the same path"** — No. Each packet is routed independently based on current network conditions. Two consecutive packets can take different routes.

## 12. Guided Practice

**Level 1:** Run `ping google.com`. What's the average latency? Run `traceroute google.com`. How many hops?

**Level 2:** Write a Python script that pings a list of hosts and reports which are up/down with their latency.

**Level 3:** Write a port scanner that checks the first 1024 ports on localhost and reports which are open.

**Level 4:** Build a simple TCP echo server and client. Client sends a message, server receives it, echoes it back with a timestamp.

## 13. Quiz

**Q1.** What is the main difference between TCP and UDP?
- a) TCP is faster, UDP is more reliable
- b) TCP guarantees delivery and order; UDP does not
- c) TCP uses IP addresses; UDP uses MAC addresses
- d) TCP is for servers; UDP is for clients

**Q2.** You visit `example.com`. Your computer doesn't know the IP address. What happens first?
- a) Your browser tries every IP address until one responds
- b) A DNS query is sent to resolve the hostname to an IP
- c) Your router finds the IP from its routing table
- d) The TCP handshake begins with the hostname

**Q3.** Port 443 is used for:
- a) SSH
- b) HTTP
- c) HTTPS
- d) FTP

**Answer Key:** B, B, C

## 14. Project Micro-Task

**Network Latency Monitor**

Build a script that:
1. Pings 5 hosts (Google, Cloudflare `1.1.1.1`, your gateway, etc.)
2. Records the round-trip time for each
3. Runs every 10 seconds
4. Logs results with timestamp to a CSV file
5. Alerts (print a warning) if latency exceeds 100ms

## 15. Project Progression Ladder

**Level 1:** Resolve hostnames to IPs using `socket.gethostbyname()`.

**Level 2:** Build a TCP port scanner with timeout handling.

**Level 3:** Build a simple HTTP server from scratch using raw sockets that serves a "Hello World" response.

**Level 4:** Build a multi-threaded TCP chat server where multiple clients can connect and send messages to all connected users.

## 16. Knowledge Transfer

- **Microservices**: Services communicate over a network. Network failures are a first-class concern. Circuit breakers, retries, and timeouts are all network-aware patterns.
- **Databases**: Connection pools manage TCP connections to the database. Each connection = one TCP socket.
- **CDNs**: Route users to the nearest server using anycast routing — the same IP address responds from multiple physical locations.
- **Security**: Firewalls operate at the network layer (block by IP) or transport layer (block by port). Understanding layers helps you configure security rules correctly.

## 17. Connection Map

**Before this:** Computer Basics (computers need to communicate)

**This enables:**
- DNS (how hostnames resolve)
- HTTP/HTTPS (the application protocol)
- APIs and web services
- Distributed systems
- Network security

## 18. Expert Thinking

**Beginner:** "My API is slow. Let me optimize the code."
**Expert:** "Let me check latency first. Is it slow locally? `curl -w "%{time_total}"`. If only slow from certain regions, it's a network problem, not a code problem. Add a CDN or a regional replica."

## 19. Expert Insights

> "Every distributed system problem I've ever seen came down to the fallacies of distributed computing. The network is NOT reliable, NOT zero latency, NOT infinite bandwidth. Design for failure from day one." — Principal engineer at a major cloud company

- `tcpdump` and Wireshark let you see every packet on your network. They're the ultimate debugging tool for network problems.
- The 8 fallacies of distributed computing: The network is reliable; latency is zero; bandwidth is infinite; the network is secure; topology doesn't change; there is one administrator; transport cost is zero; the network is homogeneous. All are false.

## 20. Memory Anchors

**Analogy:** Internet = postal system. Packets = letters. Routers = post offices. IP = address. Port = apartment number.
**Mental image:** The layered stack — application at top, physical at bottom. Each layer wraps data from the layer above.
**Key phrase:** "Packets are routed independently, hop by hop."
**Rule of thumb:** Latency matters more than bandwidth for interactive apps. Bandwidth matters more for bulk transfers.

## 21. First Principles Summary

**Three Key Ideas:**
1. Data travels as packets — small chunks, independently routed, reassembled at destination.
2. The network stack has layers: each layer adds/removes a header and does one job.
3. TCP = reliable but slower. UDP = fast but unreliable. Choose based on your app's needs.

**Three Things To Remember Forever:**
1. IP identifies machines. Ports identify services on those machines.
2. The internet is a network of networks — no single entity controls all of it.
3. Network failures are normal — design your software to expect and handle them.

**One-sentence definition:** A computer network is a system of connected devices that exchange data as labeled packets, routed hop-by-hop through interconnected nodes using agreed-upon protocols.

## 22. Mastery Challenge

You're designing a global multiplayer game that needs:
- Sub-50ms latency for players
- Position updates 60 times per second
- Chat messages that must never be lost
- Game state synchronization across 100 players

1. Which transport protocol (TCP/UDP) would you use for each requirement and why?
2. How would you handle packet loss for position updates?
3. How would you reduce latency for players in different continents?
4. What happens when a player's connection drops mid-game?
5. Sketch the network architecture including protocols, ports, and data centers.
