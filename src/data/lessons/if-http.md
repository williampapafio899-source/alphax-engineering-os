# HTTP & HTTPS

## 1. Why This Matters

HTTP is the language of the web. Every API you call, every web page you visit, every image your browser loads — all HTTP. Understanding HTTP means understanding how web apps actually communicate. It explains why some requests are slow, why browsers cache things, how authentication works, why HTTPS exists, and how to debug literally any web-related problem. Every web developer uses HTTP constantly but few understand it deeply.

## 2. Mental Model

HTTP is a **conversation between a client and a server**:

- Client (browser/app) sends a **request**: "Give me this resource"
- Server sends a **response**: "Here it is" (or "Not found" or "Error")
- Each request is independent — the server doesn't remember previous requests (stateless)
- The conversation follows strict rules (the protocol) so both sides understand each other

## 3. Powerful Analogy

HTTP is like **ordering at a restaurant**:

- You (client) tell the waiter (server): "I want the GET /menu" → waiter brings the menu
- You order: "POST /order" with your selection → waiter creates your order
- You update: "PATCH /order/123" → waiter modifies your order
- You cancel: "DELETE /order/123" → waiter removes it
- The waiter doesn't remember you between visits (stateless) — that's why restaurants give you a receipt number (session token)

## 4. Socratic Questions

- Why does the browser show a padlock for HTTPS but not HTTP?
- If HTTP is stateless, how does a website remember you're logged in?
- Why do some requests take 50ms and others take 2 seconds to the same server?
- What's the difference between a 404 and a 500 error from the server's perspective?

## 5. Deep Explanation

### HTTP Request Structure

```
GET /api/users/42 HTTP/1.1          ← Method + Path + Version
Host: api.myapp.com                  ← Required header
Authorization: Bearer eyJhbG...      ← Auth token
Accept: application/json             ← What format we want
Content-Type: application/json       ← What format we're sending
User-Agent: Mozilla/5.0...           ← Who's making the request

{                                    ← Body (optional, for POST/PUT/PATCH)
  "name": "William"
}
```

### HTTP Methods

| Method | Purpose | Has Body? | Idempotent? |
|---|---|---|---|
| `GET` | Retrieve resource | No | Yes |
| `POST` | Create resource | Yes | No |
| `PUT` | Replace resource entirely | Yes | Yes |
| `PATCH` | Partial update | Yes | No |
| `DELETE` | Remove resource | No | Yes |
| `HEAD` | Like GET, headers only | No | Yes |
| `OPTIONS` | What methods are allowed? | No | Yes |

**Idempotent** = doing it N times has the same result as doing it once. GET and DELETE are idempotent. POST is not (creates a new resource each time).

### HTTP Response Structure

```
HTTP/1.1 200 OK                      ← Version + Status code + Message
Content-Type: application/json       ← Response format
Content-Length: 127                  ← Response body size
Cache-Control: max-age=3600          ← Cache for 1 hour
Set-Cookie: session=abc123; HttpOnly ← Set a cookie

{                                    ← Response body
  "id": 42,
  "name": "William",
  "email": "w@example.com"
}
```

### Status Codes

| Range | Category | Common Examples |
|---|---|---|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | Client Error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | Server Error | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

**Key distinctions:**
- `401 Unauthorized` = not logged in
- `403 Forbidden` = logged in but not allowed
- `404 Not Found` = resource doesn't exist
- `500 Internal Server Error` = server crashed
- `503 Service Unavailable` = server is overloaded or down

### HTTPS — HTTP + TLS

HTTPS = HTTP with TLS (Transport Layer Security) encryption.

**What TLS provides:**
1. **Encryption**: Nobody can read the data in transit
2. **Authentication**: The server proves it's who it claims (via certificate)
3. **Integrity**: Data can't be tampered with in transit

**TLS Handshake (simplified):**
```
Client ──────── "Hello, I support TLS 1.3" ──────▶ Server
Client ◀────────── "Here's my certificate" ──────── Server
Client ──── "Certificate is valid, here's session key" ─▶ Server
Client ◀────────── "Agreed. Connection secure." ──── Server
[Encrypted HTTP traffic begins]
```

### HTTP Versions

| Version | Year | Key Feature |
|---|---|---|
| HTTP/1.0 | 1996 | New connection per request |
| HTTP/1.1 | 1997 | Keep-alive, pipelining |
| HTTP/2 | 2015 | Multiplexing, header compression, binary |
| HTTP/3 | 2022 | Built on QUIC (UDP), faster handshake |

HTTP/2 allows multiple requests over one TCP connection simultaneously (multiplexing), eliminating the "head-of-line blocking" problem of HTTP/1.1.

### Headers Deep Dive

**Request headers:**
- `Authorization: Bearer <token>` — JWT auth
- `Content-Type: application/json` — body format
- `Accept: application/json` — desired response format
- `If-None-Match: "abc123"` — conditional request (cache validation)

**Response headers:**
- `Cache-Control: max-age=3600` — cache for 1 hour
- `ETag: "abc123"` — resource version fingerprint
- `Location: /users/42` — used with 301/302 redirects
- `Access-Control-Allow-Origin: *` — CORS header

## 6. Visual Thinking

```
CLIENT                          SERVER
  │                               │
  │── GET /api/users HTTP/1.1 ──▶│
  │   Host: api.myapp.com         │
  │   Authorization: Bearer xxx   │
  │                               │── validates token
  │                               │── queries database
  │                               │── formats response
  │◀── HTTP/1.1 200 OK ──────────│
  │    Content-Type: json         │
  │    [{ id:1, name:"William" }] │
  │                               │
  │── POST /api/users HTTP/1.1 ─▶│
  │   {"name": "New User"}        │── creates user
  │◀── HTTP/1.1 201 Created ─────│
  │    Location: /api/users/43    │
```

## 7. Real Engineering Examples

**Beginner:** Open browser DevTools → Network tab → reload a page. You can see every HTTP request, its method, status, and response time.

**Intermediate:** An API returns `429 Too Many Requests`. Your app is hitting rate limits. Fix: implement exponential backoff retry logic.

**Advanced:** Serving the same API endpoint returns different content for different users because of `Accept-Language` and `Authorization` headers. Server uses `Vary` header to tell CDNs to cache separately per header.

**Industry:** Stripe's API uses idempotency keys — send a unique key with POST requests so that if the request times out and you retry, Stripe doesn't charge the customer twice.

## 8. Code Walkthrough

```python
import requests
import json

BASE = "https://jsonplaceholder.typicode.com"

# GET — fetch a resource
response = requests.get(f"{BASE}/posts/1")
print(f"Status: {response.status_code}")
print(f"Headers: {dict(list(response.headers.items())[:3])}")
post = response.json()
print(f"Post title: {post['title'][:50]}")

# POST — create a resource
new_post = {
    "title": "Engineering OS",
    "body": "The world's best engineering education",
    "userId": 1
}
response = requests.post(
    f"{BASE}/posts",
    json=new_post,                        # auto-sets Content-Type: application/json
    headers={"Authorization": "Bearer fake-token"}
)
print(f"\nCreated: {response.status_code}")
print(f"New post ID: {response.json().get('id')}")

# Error handling — always check status
def safe_get(url):
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()        # raises exception for 4xx/5xx
        return response.json()
    except requests.exceptions.Timeout:
        print(f"Timeout: {url}")
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error {e.response.status_code}: {url}")
    except requests.exceptions.ConnectionError:
        print(f"Connection failed: {url}")
    return None

# Check response headers
response = requests.get(f"{BASE}/posts/1")
print(f"\nCache-Control: {response.headers.get('Cache-Control', 'not set')}")
print(f"ETag: {response.headers.get('ETag', 'not set')}")
print(f"Content-Type: {response.headers.get('Content-Type')}")
```

## 9. Failure Cases

**CORS errors**: Browser blocks a request from `myapp.com` to `api.otherdomain.com`. The API needs `Access-Control-Allow-Origin` header. Server-side issue, not browser bug.

**SSL certificate expired**: HTTPS stops working. Users see security warnings. Fix: auto-renew with Let's Encrypt / certbot.

**Ignoring status codes**: App receives `500 Internal Server Error` but continues processing the empty response body. Data corruption follows. Always check status codes.

**Retrying non-idempotent requests**: Network timeout on `POST /payment`. You retry. Server processed the first request but the response was lost. Customer charged twice. Fix: use idempotency keys.

## 10. Engineering Decisions

**REST vs GraphQL?**
- REST: Simple, cacheable, standard. Best for most APIs.
- GraphQL: Flexible querying, one endpoint, good for complex frontends. More complexity server-side.

**When to use each status code?**
- Resource created: `201 Created` with `Location` header
- Async operation started: `202 Accepted`
- Successful DELETE: `204 No Content`
- Validation failed: `400 Bad Request` with error details
- Not authorized: `401` (not logged in) or `403` (logged in, no permission)

## 11. Common Misconceptions

**"HTTPS means the website is safe/trustworthy"** — HTTPS means the connection is encrypted. A phishing site can have HTTPS. The padlock means "your connection to this server is private" not "this server is good."

**"GET requests can't have a body"** — Technically they can, but many servers, proxies, and libraries ignore GET request bodies. Use query parameters for GET.

**"HTTP is stateless so you can't have sessions"** — The protocol is stateless but you store state in cookies, tokens, or databases. The session ID in a cookie lets the server look up your session.

## 12. Guided Practice

**Level 1:** Use `curl -v https://api.github.com/users/octocat` to see a full HTTP request/response. Identify the status code, headers, and body.

**Level 2:** Write Python code that fetches posts from a public API, handles errors gracefully, and prints a formatted table of results.

**Level 3:** Implement a simple retry mechanism with exponential backoff for failed HTTP requests.

**Level 4:** Build a tiny HTTP server in Python using only `socket` that handles GET requests and returns JSON responses.

## 13. Quiz

**Q1.** What is the correct HTTP status code when a new resource is created successfully?
- a) 200 OK
- b) 201 Created
- c) 204 No Content
- d) 302 Found

**Q2.** What does HTTPS add on top of HTTP?
- a) Faster loading speed
- b) Encryption, server authentication, and data integrity via TLS
- c) Compression of response bodies
- d) Support for larger request bodies

**Q3.** You send a `DELETE /users/42` request. The user doesn't exist. What status code should the server return?
- a) 200 OK
- b) 201 Created
- c) 404 Not Found
- d) 500 Internal Server Error

**Answer Key:** B, B, C

## 14. Project Micro-Task

**HTTP Status Code Checker**

Build a script that:
1. Takes a list of URLs
2. Sends HEAD requests (headers only, no body download)
3. Reports status code and response time for each
4. Highlights errors (4xx/5xx) in your output
5. Shows total check time

## 15. Project Progression Ladder

**Level 1:** Fetch 5 URLs, print status codes and response times.

**Level 2:** Build an API client class with methods for GET, POST, PUT, DELETE. Include automatic retry with backoff.

**Level 3:** Build a simple REST API mock server (Python/Flask) with GET, POST, PUT, DELETE endpoints for a "todo" resource.

**Level 4:** Build an HTTP load tester — send N concurrent requests to a URL, measure percentile response times (p50, p95, p99), and plot a latency histogram.

## 16. Knowledge Transfer

- **REST APIs**: Entirely built on HTTP verbs and status codes.
- **Authentication**: JWT tokens in `Authorization` header, session IDs in cookies — all HTTP headers.
- **CDNs**: Cache HTTP responses based on `Cache-Control` and `ETag` headers.
- **Web scraping**: Parse HTML from HTTP responses.
- **Webhooks**: Your server receives HTTP POST requests from external services.

## 17. Connection Map

**Before this:** DNS (resolves hostname) and Networks (the underlying connection)

**This enables:**
- Building REST APIs
- Authentication (JWT, OAuth, cookies)
- Web scraping
- API integration
- Understanding browser DevTools

## 18. Expert Thinking

**Beginner:** "My API call failed. I'll retry immediately."
**Expert:** "The server returned 503. That means it's overloaded. I'll retry with exponential backoff: 1s, 2s, 4s, 8s. If it's still failing after 5 retries, I'll circuit-break and return a cached response."

## 19. Expert Insights

> "The number of engineers who properly handle HTTP error codes and retries in production is depressingly small. Most apps either never retry or retry too aggressively and make the problem worse." — Backend engineer at a payments company

- Use browser DevTools Network tab on every site you visit. You'll learn more about real-world HTTP patterns in a week than in months of reading.
- HTTP/2 multiplexing is why modern web pages load so much faster than they did in 2010 despite being 10× larger.

## 20. Memory Anchors

**Analogy:** HTTP = ordering at a restaurant. Request = order. Response = food delivery. Status codes = "here it is" / "we don't have that" / "kitchen on fire."
**Mental image:** The request/response cycle — client sends up, server sends back.
**Key phrase:** "HTTP is stateless — every request is independent."
**Rule of thumb:** 2xx = success, 4xx = your fault, 5xx = their fault.

## 21. First Principles Summary

**Three Key Ideas:**
1. HTTP is a request/response protocol — client asks, server answers, connection done.
2. Methods (GET, POST, PUT, DELETE) describe the action. Status codes (200, 404, 500) describe the result.
3. HTTPS wraps HTTP in TLS — encrypting the conversation and verifying the server's identity.

**Three Things To Remember Forever:**
1. Always check HTTP status codes — never assume success.
2. GET is safe and idempotent. POST creates, is not idempotent. Use the right method.
3. 401 = not authenticated. 403 = authenticated but not authorized. Different problems.

**One-sentence definition:** HTTP is a stateless, text-based request/response protocol that defines how clients and servers exchange structured messages to transfer data across the web.

## 22. Mastery Challenge

Design the HTTP API for a banking application:

1. Define endpoints for: view balance, transfer money, transaction history, create account.
2. Assign correct HTTP methods and status codes for each scenario (success, not found, insufficient funds, unauthorized).
3. How do you prevent double-charging if a transfer request times out and the client retries?
4. Which endpoints should be cached? Which should never be cached? Use HTTP headers.
5. How does HTTPS protect a user's transfer even on a coffee shop WiFi network?
