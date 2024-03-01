#!/bin/bash

SELF_PATH=$(readlink -f "${BASH_SOURCE[0]:-"$(command -v -- "$0")"}")
SELF_DIR=$(dirname $SELF_PATH)

if [ -z "$PNPM_PACKAGE_NAME" ]; then
  exit 0
fi

echo "Check compliance for $PNPM_PACKAGE_NAME"

echo "::group::Calculate next version"
tag=$(pnpm --filter "$PNPM_PACKAGE_NAME" exec release-it --config $SELF_DIR/.release-it.json --release-version)
if [ "$?" != "0" ]; then
  echo "::error::Failed to calculate next version"
  echo "::endgroup::"
  exit 1
fi
echo "Next version is $tag"
echo "::endgroup::"

echo "::group::Find api key"
key=$(echo "$API_KEY" | jq '."$PNPM_PACKAGE_NAME"' 2>/dev/null)
if [ "$?" != "0" ]; then
  # The API_KEY was not a json so will treat it a string instead
  key="$API_KEY"
fi

if [ -z "$key" ]; then
  echo "::warning::No API_KEY for $PNPM_PACKAGE_NAME. Will skip compliance check"
  echo "::endgroup::"
  exit 0
fi
echo "::endgroup::"

echo "::group::Run api-compliance"
docker pull ghcr.io/qlik-download/api-compliance
docker create -v /specs --name specs alpine:3.4 "/bin/true"
docker cp "$API_SPECIFICATION_PATH" specs:/specs/properties.json

docker run --volumes-from specs \
  -e SPEC_PATHS="$key@/specs/properties.json" \
  -e COMMIT_SHA="$(git rev-parse HEAD)" \
  -e RELEASE_TAG="$tag" \
  -e CREDENTIALS_S3_SECRETKEY="$APICULTURIST_S3" \
  -e CREDENTIALS_GITHUB="$APICULTURIST_GITHUB" \
  -e CREDENTIALS_COLONY="$APICULTURIST_TOKEN" \
  ghcr.io/qlik-download/api-compliance
echo "::endgroup::"
