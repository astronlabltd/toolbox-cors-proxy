# @astronlab/toolbox-cors-proxy

A lightweight local CORS proxy for [AstronLab Tools](https://toolbox-dashboard.pages.dev).

Run it locally to keep all network requests on your machine instead of routing through the cloud proxy.

## Quick Start

```bash
npx @astronlab/toolbox-cors-proxy
# → Listening on http://127.0.0.1:8888
```

Custom port:

```bash
npx @astronlab/toolbox-cors-proxy 9090
# → Listening on http://127.0.0.1:9090
```

## Configure in AstronLab Tools

1. Open [AstronLab Tools](https://toolbox-dashboard.pages.dev)
2. Click the **⚙️** icon in the top-right navbar
3. Select **🖥️ Local**
4. Enter your proxy URL: `http://127.0.0.1:8888`

## Supported Platforms

Since it is written in pure JavaScript (ESM) using Node.js built-in APIs, it runs natively on **any operating system** (macOS, Windows, Linux, FreeBSD, etc.) and CPU architecture (x64, arm64, etc.) where Node.js is installed.

Node.js **v18.0.0 or higher** is required.

## API

The proxy exposes a single endpoint:

```
GET/POST http://127.0.0.1:8888/proxy?url=<target-url>
```

All request headers, body, and method are forwarded to the target URL.
CORS headers are added to every response so browser-based apps can access any endpoint.

## Privacy

All traffic stays on your local machine. No data is sent to AstronLab servers.
