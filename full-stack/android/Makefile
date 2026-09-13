.PHONY: build install uninstall reinstall run help local.properties

GRADLE := ./gradlew
SDK_DIR ?= $(firstword $(wildcard $(HOME)/Android/Sdk) $(ANDROID_HOME) $(ANDROID_SDK_ROOT))
PACKAGE := com.mdviewer.app

# Server the app talks to. Default works with `make reverse` over USB.
SERVER_URL ?= http://192.168.0.112:3000/

.DEFAULT_GOAL := help

## Build debug APK
build: local.properties
	$(GRADLE) assembleDebug -PserverUrl=$(SERVER_URL)

## Print debug SHA-1 for Google Cloud Android OAuth client
sha1: local.properties
	@$(GRADLE) signingReport 2>&1 | awk '/Variant: debug$$/,/^$$/' | grep -E 'Variant:|SHA1:'

## Install debug APK on connected device or emulator
install: local.properties
	$(GRADLE) installDebug -PserverUrl=$(SERVER_URL)

## Remove app from connected device (fixes INSTALL_FAILED_UPDATE_INCOMPATIBLE)
uninstall:
	adb uninstall $(PACKAGE)

## Uninstall then install (use when signatures do not match)
reinstall: uninstall install

local.properties:
	@if [ -z "$(SDK_DIR)" ]; then \
		echo "Android SDK not found. Set ANDROID_HOME or install SDK to ~/Android/Sdk"; \
		exit 1; \
	fi
	@if [ ! -f local.properties ]; then \
		echo "sdk.dir=$(SDK_DIR)" > local.properties; \
	elif ! grep -q '^sdk.dir=' local.properties; then \
		echo "sdk.dir=$(SDK_DIR)" >> local.properties; \
	fi

## Show available targets
help:
	@grep -E '^##' Makefile | sed 's/^## //'
