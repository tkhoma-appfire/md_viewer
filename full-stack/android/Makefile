.PHONY: build install help local.properties

GRADLE := ./gradlew
SDK_DIR ?= $(firstword $(wildcard $(HOME)/Android/Sdk) $(ANDROID_HOME) $(ANDROID_SDK_ROOT))

.DEFAULT_GOAL := help

## Build debug APK
build: local.properties
	$(GRADLE) assembleDebug

## Install debug APK on connected device or emulator
install: local.properties
	$(GRADLE) installDebug

local.properties:
	@if [ -z "$(SDK_DIR)" ]; then \
		echo "Android SDK not found. Set ANDROID_HOME or install SDK to ~/Android/Sdk"; \
		exit 1; \
	fi
	@echo "sdk.dir=$(SDK_DIR)" > local.properties

## Show available targets
help:
	@grep -E '^##' Makefile | sed 's/^## //'
