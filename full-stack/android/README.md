# MD Viewer (Android)

Kotlin + Jetpack Compose app for the full-stack MD viewer. Sign in with Google, then load the markdown file list from the API in `../server/`.

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (recommended) or command-line tools only
- Android SDK (API 35) — installed with Android Studio, usually at `~/Android/Sdk`
- JDK 17+
- Google Play services on the device
- A physical device with **USB debugging** enabled, or an Android emulator
- A Google Cloud OAuth client (see [Google Sign-In](#google-sign-in) below)

`adb` must see your device:

```bash
adb devices
```

## Setup

From this directory (`full-stack/android/`):

1. Open the project in Android Studio and let Gradle sync, **or**
2. Ensure the SDK path is available — the Makefile writes `local.properties` automatically from `~/Android/Sdk` or `ANDROID_HOME`.
3. Add your Google Web client ID to `local.properties` (see [Google Sign-In](#google-sign-in)).

`local.properties` is gitignored and not committed.

Example `local.properties`:

```properties
sdk.dir=/home/you/Android/Sdk
GOOGLE_WEB_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
```

## Google Sign-In

Sign-in uses Android Credential Manager. The server is **not** involved — authentication gates the app UI only.

### 1. Google Cloud Console

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. Configure the OAuth consent screen (**External**) and add your Google account as a **test user**.
3. Create an **Android** OAuth client:
   - Package name: `com.mdviewer.app`
   - SHA-1 fingerprint (debug keystore):
     ```bash
     keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | grep SHA1
     ```
4. Create a **Web application** OAuth client and copy its **client ID**.

You need **two separate** OAuth clients in the same project:

| Type | Used for |
|------|----------|
| **Android** | Registers `com.mdviewer.app` + SHA-1 (required, but ID is **not** put in the app) |
| **Web application** | Value for `GOOGLE_WEB_CLIENT_ID` in `local.properties` |

The Android and Web client IDs look similar (`…apps.googleusercontent.com`) but are **different strings**. Using the Android client ID in `GOOGLE_WEB_CLIENT_ID` causes "No credentials available".

### 2. local.properties

Add the Web client ID:

```properties
GOOGLE_WEB_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

Use the **Web client ID** from Google Cloud Console (ends with `.apps.googleusercontent.com`).
Do **not** use the client secret (`GOCSPX-…`) — that causes "No credentials available".

Rebuild and reinstall after changing this value.

Sign-in requires **internet** on the device (mobile data is fine) plus Google Play services.

## Build and install (Makefile)

| Command | Description |
|---------|-------------|
| `make build` | Build debug APK (`app/build/outputs/apk/debug/md-viewer.apk`) |
| `make install` | Build and install on a connected device/emulator |
| `make run` | `reverse` + `install` + launch the app |
| `make help` | List targets |

Examples:

```bash
make build
make run
```

Override SDK location if needed:

```bash
make install SDK_DIR=/path/to/Android/Sdk
```

## Build and install (Gradle)

```bash
./gradlew assembleDebug
./gradlew installDebug
```

Manual install of an existing APK:

```bash
adb install -r app/build/outputs/apk/debug/md-viewer.apk
```

## Run from Android Studio

1. Open `full-stack/android/` in Android Studio.
2. Select a device or emulator.
3. Click **Run** (green triangle).

## App info

| | |
|--|--|
| Package | `com.mdviewer.app` |
| minSdk | 24 |
| targetSdk | 35 |

## Backend API

Start the server first (from `../server/`):

```bash
make run
# or: npm start
```

The app calls `GET /api/mds/` after sign-in and shows the returned file paths in a list.

The server URL is a build-time setting. The default is `https://md-viewer-pied.vercel.app/`.

| Setup | Command |
|-------|---------|
| Production (default) | `make install` |
| Local server via USB | `make install SERVER_URL=http://127.0.0.1:3000/` and `make run` (server) |
| Emulator + local server | `make install SERVER_URL=http://10.0.2.2:3000/` |
| Phone on same Wi-Fi as PC | `make install SERVER_URL=http://192.168.0.112:3000/` |


```bash
make run
```

The forward is cleared when the device is unplugged or `adb` restarts; re-run `make reverse` to restore it.

### Wi-Fi connection

The phone must be on the **same Wi-Fi network** as the computer — mobile data and USB tethering will not work.

Check what the phone is actually connected to:

```bash
adb shell ip -4 addr show        # look for a wlan0 address like 192.168.0.x
adb shell ping -c 3 192.168.0.112
```

If `ping` fails or there is no `wlan0` address, the phone is not on your LAN. Either connect it to Wi-Fi or use the USB method above.

### Troubleshooting

| Symptom | Cause |
|---------|-------|
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | An older build with a different signing key is installed. Run `adb uninstall com.mdviewer.app` first. |
| "Set GOOGLE_WEB_CLIENT_ID in local.properties" | Web client ID missing; add it and rebuild. |
| Google sign-in fails / "No credentials available" | Wrong value in `GOOGLE_WEB_CLIENT_ID` (often the `GOCSPX-` secret instead of the Web client ID), missing Android OAuth client, or account not added as test user. |
| `"[16] Account reauth failed"` | Usually **DEVELOPER_ERROR** — Android OAuth client has wrong SHA-1 or package name, or Web client ID is wrong type. Run `./gradlew signingReport` and update the Android client in Google Cloud. OAuth consent must be **External**. |
| App shows "Cannot reach server" | Wrong `SERVER_URL`, server down, or (for local dev) phone not on the same network. |
| Works in `curl` but not on phone | Phone is on mobile data, not Wi-Fi. Use `make run`. |
