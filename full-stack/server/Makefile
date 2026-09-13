.PHONY: build run run-port run-native help

IMAGE := md-viewer-server
PORT ?= 3000

.DEFAULT_GOAL := help

## Build Docker image
build:
	docker build -t $(IMAGE) .

## Run container with host network (recommended for phone access on Linux)
run:
	docker run --rm --network host \
	  -v $(CURDIR)/mds:/data/mds \
	  -v $(CURDIR)/comments:/app/comments \
	  -e COMMENTS_DIR=/app/comments \
	  $(IMAGE)

## Run container with port mapping
run-port:
	docker run --rm -p $(PORT):3000 \
	  -v $(CURDIR)/mds:/data/mds \
	  -v $(CURDIR)/comments:/app/comments \
	  -e COMMENTS_DIR=/app/comments \
	  $(IMAGE)

## Run without Docker
run-native:
	npm start

## Show available targets
help:
	@grep -E '^##' Makefile | sed 's/^## //'
