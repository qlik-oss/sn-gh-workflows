#!/bin/bash
# set -x

echo "Uploading files in folder $(pwd)"

systemjs=$(cat package.json | jq -r '.systemjs')

echo "PWD"
echo $(pwd)
echo "Systemjs"
echo $systemjs

if [ "$systemjs" == "null" ]; then
  echo "::notice::No systemjs build for this package. Skipping $(pwd)"
  exit 0
fi

echo $(pwd)/$systemjs
