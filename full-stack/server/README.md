# MD Viewer API (full-stack server)

Express API for the full-stack MD viewer. Serves markdown files from a local `mds/` directory for the Android client (and other HTTP clients).

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (ES modules)

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Default URL: **http://localhost:3000**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `MDS_DIR` | `./mds` (next to `src/`) | Directory containing `.md` files |

Example with a custom port and markdown folder:

```bash
PORT=3100 MDS_DIR=/path/to/notes npm start
```

The server binds to `0.0.0.0`, so it is reachable from other devices on your network (and from the Android emulator via `10.0.2.2` when the host port is forwarded).

## Markdown files (`mds/`)

Put `.md` files in **`mds/`** at the project root of this server (`full-stack/server/mds/`). Subfolders are scanned recursively. Symbolic links to `.md` files or directories are followed.

This folder is gitignored; files stay on your machine and are not committed.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Hello World |
| `GET` | `/api/health` | Service status and resolved `mdsDir` |
| `GET` | `/api/mds/` | List `.md` files with `path` and `title` (first line, `#` stripped) |
| `GET` | `/api/mds/file?path=…` | Read one file’s content |
| `GET` | `/api/mds/comments?path=…` | List comments for a file |
| `POST` | `/api/mds/comments` | Add a comment (`{ path, line, text }`; author from `X-User-Email`) |

Every request is logged to stdout with timestamp, `X-User-Email` (or `(anonymous)`), method, path, status, and duration. The Android app sends the signed-in user’s email in that header.

Comments are stored under `comments/` (gitignored), one JSON file per markdown path.

### List files

```bash
curl http://localhost:3000/api/mds/
```

Response:

```json
{
  "files": [
    { "path": "notes/example.md", "title": "Example title" }
  ]
}
```

`title` is the first line of the file with `#` characters removed.

### Read a file

```bash
curl "http://localhost:3000/api/mds/file?path=notes/example.md"
```

Response:

```json
{
  "path": "notes/example.md",
  "content": "# Title\n\n..."
}
```

Errors: `400` for invalid path, `404` if the file does not exist.

## Docker

```bash
make build
make run          # host network (recommended for phone access on Linux)
make run-port     # port mapping -p 3000:3000
make run-native   # without Docker
```

## Access from a phone

The server must be reachable on your LAN.

1. Find your PC IP on Wi‑Fi (example: `192.168.0.112`):
   ```bash
   ip -4 addr show wlp0s20f3 | grep inet
   ```
2. Start the server (`make run` or `npm start`).
3. On the phone browser, open **`http://192.168.0.112:3000/api/health`** (include `http://`).

   **If `curl` works but the browser says “unreachable”**, the browser is probably using **HTTPS**. The server speaks HTTP only. Typing `192.168.0.112:3000` without `http://` makes Chrome/Firefox try `https://…`, which fails.

   - Use the full URL: `http://192.168.0.112:3000/api/health`
   - Chrome: Settings → Privacy → turn off **Always use secure connections**
   - Firefox: disable **HTTPS-Only Mode** for this test
4. Phone and PC must be on the **same Wi‑Fi** (not mobile data, not guest Wi‑Fi with client isolation).
5. If the browser test fails, open port 3000 in the firewall:
   ```bash
   sudo ufw allow 3000/tcp
   ```
6. If Docker is used and the phone still cannot connect, prefer `make run` (host network) over `make run-port`.

Set the same URL in the Android app (`SERVER_BASE_URL` in `app/build.gradle.kts`) and reinstall:
```bash
cd ../android && make install
```
