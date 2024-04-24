#!/bin/bash

echo "Scanning $(cat package.json | jq -r '.name') in folder $(pwd)"

stardust=$(cat package.json | jq -r '.peerDependencies["@nebula.js/stardust"]')

if [ "$stardust" != "null"  ]; then
    if [[ "$stardust" != \>* ]]; then
      echo "::error::Incorrect Nebula peer dependency semver check, please use the form >=X.Y.Z and not ^X.Y.Z"
      exit 1;
    else 
       echo "Stardust dependency correctly specified"
    fi
else
  echo "::notice::No stardust peer dependency. Skipping this package"
fi