# MD Viewer API (full-stack server)

Express API for the full-stack MD viewer. Serves markdown files from a local `mds/` directory for the Android client (and other HTTP clients).

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (ES modules)

## Setup

```bash
npm install
```

This project includes `.npmrc` pointing at the public npm registry (`https://registry.npmjs.org/`). That is required for Vercel and other CI hosts that cannot authenticate to a corporate Nexus mirror.

If `npm install` fails on Vercel with `Unable to authenticate … Sonatype Nexus`, regenerate the lockfile from this directory (not from a machine that uses a private registry):

```bash
rm -rf node_modules package-lock.json
npm install --registry=https://registry.npmjs.org/
```

Commit the updated `package-lock.json` (all `resolved` URLs should be `registry.npmjs.org`, not `nexus.…`).

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
| `POST` | `/api/mds/file` | Upload or replace a file (`{ path, content }`; requires `X-User-Email`) |
| `GET` | `/api/mds/comments?path=…` | List comments for a file |
| `POST` | `/api/mds/comments` | Add a comment (`{ path, line, text }`; author from `X-User-Email`) |
| `DELETE` | `/api/mds/comments` | Remove own comment (`{ path, id }`; requires `X-User-Email`) |
| `GET` | `/api/mds/access?path=…` | List viewer emails allowed for a file |
| `PUT` | `/api/mds/access` | Set viewer emails (`{ path, emails }`; requires `X-User-Email`) |
| `DELETE` | `/api/mds/access` | Remove one viewer email (`{ path, email }`; requires `X-User-Email`) |

Every request is logged to stdout with timestamp, `X-User-Email` (or `(anonymous)`), method, path, status, and duration. The Android app sends the signed-in user’s email in that header.

Comments are stored under `comments/` (gitignored), one JSON file per markdown path.

**Viewer access:** If a file has no access record, any client can list and read it. After `PUT /api/mds/access`, only emails in that list (matched case-insensitively) can list, read, comment on, or update access for the file. The user who creates the list is added automatically if missing. Access lists are stored under `access/` (gitignored).

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

### Upload a file

Creates a new `.md` file under `mds/` (creates subfolders as needed). Replaces an existing file if you have access to it.

```bash
curl -X POST http://localhost:3000/api/mds/file \
  -H "Content-Type: application/json" \
  -H "X-User-Email: you@example.com" \
  -d '{
    "path": "notes/example.md",
    "content": "# Example title\n\nHello from upload."
  }'
```

Response (`201` created, `200` updated):

```json
{
  "path": "notes/example.md",
  "title": "Example title",
  "created": true
}
```

Errors: `401` if `X-User-Email` is missing, `403` if the file exists and you are not allowed to view it, `400` if `path` or `content` is invalid.

### Restrict who can view a file

First request creates the access list. Send your email in `X-User-Email`; it is added automatically if not already in `emails`.

```bash
curl -X PUT http://localhost:3000/api/mds/access \
  -H "Content-Type: application/json" \
  -H "X-User-Email: you@example.com" \
  -d '{
    "path": "notes/example.md",
    "emails": ["you@example.com", "colleague@example.com"]
  }'
```

Response:

```json
{
  "path": "notes/example.md",
  "emails": ["colleague@example.com", "you@example.com"],
  "restricted": true,
  "updatedAt": "2026-09-13T07:00:00.000Z",
  "updatedBy": "you@example.com"
}
```

To read the current list (requires an allowed email once restricted):

```bash
curl "http://localhost:3000/api/mds/access?path=notes/example.md" \
  -H "X-User-Email: you@example.com"
```

Errors: `401` if `X-User-Email` is missing on `PUT`, `403` if the caller is not allowed to view or update the file, `400` if `path` or `emails` is invalid.

Remove one email from the list (caller must already be allowed to view the file). If that was the last email, restrictions are cleared and the file becomes public again.

```bash
curl -X DELETE http://localhost:3000/api/mds/access \
  -H "Content-Type: application/json" \
  -H "X-User-Email: you@example.com" \
  -d '{
    "path": "notes/example.md",
    "email": "colleague@example.com"
  }'
```

Response:

```json
{
  "path": "notes/example.md",
  "email": "colleague@example.com",
  "emails": ["you@example.com"],
  "restricted": true,
  "updatedAt": "2026-09-13T07:00:00.000Z",
  "updatedBy": "you@example.com"
}
```

If the removed email was the last one, `restricted` is `false` and `emails` is `[]`.

Errors: `401` if `X-User-Email` is missing, `403` if the caller cannot view the file, `404` if there is no access list or the email is not listed.

### Delete your comment

Only the comment author (matched by `X-User-Email`, case-insensitive) can delete it.

```bash
curl -X DELETE http://localhost:3000/api/mds/comments \
  -H "Content-Type: application/json" \
  -H "X-User-Email: you@example.com" \
  -d '{
    "path": "notes/example.md",
    "id": "comment-uuid-from-get-comments"
  }'
```

Response:

```json
{
  "path": "notes/example.md",
  "id": "comment-uuid-from-get-comments"
}
```

Errors: `401` if `X-User-Email` is missing, `403` if you are not the comment owner, `404` if the comment or file is not found.

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
