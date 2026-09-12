.PHONY: build run help

IMAGE := md-viewer-server
PORT ?= 3000

.DEFAULT_GOAL := help

## Build Docker image
build:
	docker build -t $(IMAGE) .

## Run container (foreground); maps port and mounts ./mds
run:
	docker run --rm -p $(PORT):3000 -v $(CURDIR)/mds:/data/mds $(IMAGE)

## Show available targets
help:
	@grep -E '^##' Makefile | sed 's/^## //'
