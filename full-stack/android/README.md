# MD Viewer (Android)

Kotlin + Jetpack Compose app for the full-stack MD viewer. Currently shows a Hello World screen; it will connect to the API in `../server/`.

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
| `make help` | List targets |

Examples:

```bash
make build
make install
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

The server lives in `../server/`. On the **Android emulator**, use `http://10.0.2.2:3000` to reach a server running on your host at port 3000. On a **physical device**, use your computer’s LAN IP instead of `localhost`.
