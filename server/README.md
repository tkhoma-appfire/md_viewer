# MD Viewer

React (Vite) frontend in `client/`, Node (Express) API in `server/`, and an **nginx** reverse proxy so everything is reachable under **`http://localhost/md_viewer/`**.

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) with the **Compose plugin** (`docker compose version` should work). Legacy `docker-compose` (hyphen) is not required if you use `docker compose` (space).

## Run with Docker Compose

From the project root (`md_viewer/`, where `docker-compose.yml` lives):

### Build and start (foreground)

Logs from all services stream to the terminal. Press **Ctrl+C** to stop containers.

```bash
docker compose up --build
```

`--build` rebuilds images when you change Dockerfiles or app code copied into the image. Omit `--build` if images are already up to date:

```bash
docker compose up
```

### Run in the background

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop and remove containers (keeps images and named volumes, if any):

```bash
docker compose down
```

### Build images only

```bash
docker compose build
```

## After it is running

| What | URL |
|------|-----|
| Web app | http://localhost/md_viewer/ |
| API example | http://localhost/md_viewer/api/health |

The Compose file maps host **port 80** to nginx. If something else already uses port 80, change `docker-compose.yml` under the `nginx` service, for example:

```yaml
ports:
  - "8080:80"
```

Then use **http://localhost:8080/md_viewer/** (and the same host/port for API paths under `/md_viewer/api/`).

## Services (Compose)

- **nginx** — Public entrypoint; proxies `/md_viewer/` to the client container and `/md_viewer/api/` to the server.
- **client** — Built static assets served by nginx inside that container.
- **server** — Express on port 3000 (internal to the Compose network).

### Markdown files (`mds/`)

The host directory **`./mds`** is bind-mounted into the server container as **`/data/mds`** (`MDS_DIR`). Edits you save in the UI are written back to files on your machine under `mds/`. Put `.md` files there (nested folders are listed recursively).

API (also proxied under `/md_viewer/api/…` in the browser):

- `GET /api/mds` — folder tree of `.md` files (`tree`: nested `dir` / `file` nodes with `name`, `path`, and `children` for folders).
- `GET /api/mds/file?path=…` — read one file.
- `PUT /api/mds/file` — JSON `{ "path": "…", "content": "…" }` to save (creates parent directories if needed).

## Local development (without Docker)

```bash
# API
cd server && npm install && PORT=3000 npm start

# Frontend (another terminal)
cd client && npm install && npm run dev
```

Use the URL Vite prints; with `base: '/md_viewer/'`, paths like `http://localhost:5173/md_viewer/` match production routing. The browser will call `/md_viewer/api/...`; you may need a Vite dev proxy to the API or run requests against a Compose stack for API during UI work.
