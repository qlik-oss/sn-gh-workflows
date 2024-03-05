#!/bin/bash
# set -x

exit_on_error() {
  echo $1
  exit 1
}

SELF_PATH=$(readlink -f "${BASH_SOURCE[0]:-"$(command -v -- "$0")"}")
SELF_DIR=$(dirname $SELF_PATH)

if [ -z "$PNPM_PACKAGE_NAME" ]; then
  exit 0
fi

echo "Check compliance for $PNPM_PACKAGE_NAME"
searchstring="/"

package=${PNPM_PACKAGE_NAME#*"/"}

echo "::group::<$PNPM_PACKAGE_NAME> - Find api key"
key=$(echo "$API_KEY" | jq -r ".\"$package\"" 2>/dev/null)
if [ "$?" != "0" ]; then
  # The API_KEY was not a json so will treat it a string instead
  key="$API_KEY"
fi
echo "::endgroup::"

if [ -z "$key" ] || [ $key == "null" ]; then
  echo "::notice::No API_KEY for $package. Will skip compliance check"
  exit 0
fi


echo "::group::<$PNPM_PACKAGE_NAME> - Calculate next version"
tag=$(pnpm --filter "$PNPM_PACKAGE_NAME" exec release-it --config $SELF_DIR/../release-it/.release-it.js --no-github --no-npm --git.requireBranch= --release-version)
release_it_result=$?
echo "Next version is $tag"
echo "::endgroup::"
if [ $release_it_result != 0 ]; then
  exit_on_error "::error::Failed to calculate next version"
fi

echo "::group::<$PNPM_PACKAGE_NAME> - Generate new spec"
pnpm run spec || exit_on_error "::error::Failed to run the spec script in $(pwd)"

# Test if api specification has changed
git status --porcelain || exit_on_error "::error::Your API specification has changed when running yarn spec. Make sure you commit your API spec changes, or remove unintended changes in the properties definition"

if ! [ -z "$tag"]; then
  echo "$(jq --arg tag $tag '.info.version = $tag' $API_SPECIFICATION_PATH)" > "$API_SPECIFICATION_PATH"
fi
echo "::endgroup::"

echo "::group::<$PNPM_PACKAGE_NAME> - Run api-compliance"
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
api_compliance_result=$?
echo "::endgroup::"

if [ $api_compliance_result != 0 ]; then
  exit_on_error "::error::API failed compliance check"
fi

git restore "$API_SPECIFICATION_PATH"