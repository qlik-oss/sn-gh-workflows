#!/bin/bash
# set -x

echo "Scanning package.json in folder $(pwd)"

stardust=$(cat package.json | jq -r '.peerDependencies["@nebula.js/stardust"]')

if [ "$stardust" == "null"  ]; then
  echo "::notice::No stardust peer dependency. Skipping $(pwd)"
  exit 0;
fi

pattern="^>"
if [[ $stardust =~ $pattern ]]; then
  echo "Stardust dependency correctly specified"
  exit 0;
else 
  echo "::error::Incorrect nebula stardust peer dependency semver check, please use the form >=X.Y.Z and not ^X.Y.Z ($(pwd), $stardust)"
  exit 1;
fi