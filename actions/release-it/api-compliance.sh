#!/bin/bash

version=$1
API_KEY=$2
docker pull ghcr.io/qlik-download/api-compliance
docker create -v /specs --name specs alpine:3.4 "/bin/true"
docker cp "$API_SPECIFICATION_PATH" specs:/specs/properties.json

docker run --volumes-from specs \
  -e SPEC_PATHS="$API_KEY@/specs/properties.json" \
  -e COMMIT_SHA="$(git rev-parse HEAD)" \
  -e RELEASE_TAG="$version" \
  -e CREDENTIALS_S3_SECRETKEY="$APICULTURIST_S3" \
  -e CREDENTIALS_GITHUB="$APICULTURIST_GITHUB" \
  -e CREDENTIALS_COLONY="$APICULTURIST_TOKEN" \
  ghcr.io/qlik-download/api-compliance
