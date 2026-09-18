# MD Viewer (full-stack)

Mobile client + API for browsing and commenting on markdown files under `server/mds/`.

| Part | Path | Role |
|------|------|------|
| **Server** | [`server/`](server/) | Express API — markdown tree, file content, comments, access lists |
| **Android** | [`android/`](android/) | Jetpack Compose app — Google sign-in, folder tree, read files, line comments |

Production API: **https://md-viewer-pied.vercel.app/**

---

## Server deployment (Vercel)

The server is hosted on **[Vercel](https://vercel.com)**. When the Git repository is linked to a Vercel project, **each push to the connected branch triggers a new deployment** (Production for the production branch, Preview for other branches).

### One-time Vercel setup

1. Import the repo in Vercel (or link it under **Project Settings → Git**).
2. Set **Root Directory** to **`full-stack/server`** (important — the API lives there, not the repo root).
3. Vercel uses [`server/vercel.json`](server/vercel.json) and the `@vercel/node` builder on `src/index.js`.
4. For **comments** and **viewer access lists**, add a Vercel Blob store and set **`BLOB_READ_WRITE_TOKEN`** in project environment variables, then redeploy. Markdown files ship from `server/mds/` in the repo; only comments/access use Blob on Vercel.

After deploy, check:

```bash
curl https://md-viewer-pied.vercel.app/api/health
```

More detail (API, Blob, Docker, local dev): **[server/README.md](server/README.md)**.

### What gets published on push

- Server code under `full-stack/server/`
- Markdown files under `full-stack/server/mds/` (including subfolders)
- **Not** deployed: the Android app (installed separately on devices)

---

## Install the Android app

The app is **not** published through Vercel or the Play Store in this repo — you build and install it on a device or emulator.

### Prerequisites

- Android Studio (or Android SDK + JDK 17+)
- A phone with **USB debugging** or an emulator
- Google Cloud OAuth setup (Android + **Web** client) — see **[android/README.md](android/README.md#google-sign-in)**

Create `full-stack/android/local.properties` (gitignored):

```properties
sdk.dir=/home/you/Android/Sdk
GOOGLE_WEB_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

Use the **Web application** client ID from Google Cloud (not the Android client ID, not the `GOCSPX-` secret).

Verify the device:

```bash
adb devices
```

### Install (recommended)

From **`full-stack/android/`**:

```bash
make install
```

This builds a debug APK and installs it. By default the app talks to **`https://md-viewer-pied.vercel.app/`** (production server).

Other useful targets:

| Command | Description |
|---------|-------------|
| `make build` | Build APK only (`app/build/outputs/apk/debug/md-viewer.apk`) |
| `make run` | Install + launch (see android README for USB port forwarding) |
| `make reinstall` | Uninstall then install (fixes signature mismatch) |
| `make help` | List Makefile targets |

### Install from Android Studio

1. Open **`full-stack/android/`** in Android Studio.
2. Wait for Gradle sync.
3. Select a device or emulator.
4. Click **Run** (green triangle).

### Install a built APK manually

```bash
cd full-stack/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/md-viewer.apk
```

### Point the app at a local server (optional)

Rebuild with a different API URL, then reinstall:

```bash
# Phone on same Wi‑Fi as PC (replace with your PC’s LAN IP)
make install SERVER_URL=http://192.168.0.112:3000/

# Emulator → host machine
make install SERVER_URL=http://10.0.2.2:3000/

# USB + adb reverse (see android/README.md)
make install SERVER_URL=http://127.0.0.1:3000/
make run
```

Start the local API from **`full-stack/server/`**: `npm start` or `make run`.

Full troubleshooting (sign-in, network, `INSTALL_FAILED_UPDATE_INCOMPATIBLE`): **[android/README.md](android/README.md)**.

---

## Local development (quick reference)

**Server**

```bash
cd full-stack/server
npm install
npm start
# → http://localhost:3000
```

**Android** (production API)

```bash
cd full-stack/android
make install
```

**Android** (local API on same Wi‑Fi)

```bash
cd full-stack/server && npm start
cd full-stack/android && make install SERVER_URL=http://YOUR_PC_IP:3000/
```

---

## Related docs

- [server/README.md](server/README.md) — API, Vercel Blob, Docker, comments & access
- [android/README.md](android/README.md) — Google Sign-In, Gradle, Makefile, networking
