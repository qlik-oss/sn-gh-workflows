#!/bin/bash
# set -x

echo "Uploading dev builds for folder $(pwd)"

systemjs=$(cat package.json | jq -r '.systemjs')

if [ "$systemjs" == "null" ]; then
  echo "::notice::No systemjs build for this package. Skipping $(pwd)"
  exit 0
fi

echo $(pwd)/$systemjs