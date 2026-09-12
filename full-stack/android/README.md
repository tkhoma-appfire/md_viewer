# MD Viewer (Android)

Kotlin + Jetpack Compose app for the full-stack MD viewer. On launch it loads the markdown file list from the API in `../server/`.

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (recommended) or command-line tools only
- Android SDK (API 35) — installed with Android Studio, usually at `~/Android/Sdk`
- JDK 17+
- A physical device with **USB debugging** enabled, or an Android emulator

`adb` must see your device:

```bash
adb devices
```

## Setup

From this directory (`full-stack/android/`):

1. Open the project in Android Studio and let Gradle sync, **or**
2. Ensure the SDK path is available — the Makefile writes `local.properties` automatically from `~/Android/Sdk` or `ANDROID_HOME`.

`local.properties` is gitignored and not committed.

## Build and install (Makefile)

| Command | Description |
|---------|-------------|
| `make build` | Build debug APK (`app/build/outputs/apk/debug/app-debug.apk`) |
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
adb install -r app/build/outputs/apk/debug/app-debug.apk
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

The app calls `GET /api/mds/` on startup and shows the returned file paths in a list.

The server URL is a build-time setting. The default is `http://192.168.0.112:3000/`

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
| App shows "Cannot reach server" | Wrong `SERVER_URL`, server not running, or phone not on the same network. |
| Works in `curl` but not on phone | Phone is on mobile data, not Wi-Fi. Use `make run`. |
