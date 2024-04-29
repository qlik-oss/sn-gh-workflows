#!/bin/bash
export
major=$(echo $VERSION | cut -d '.' -f 1)

tag=v$major

# if [ ! $DRY_RUN ]; then
#   echo doing git
git tag -d $tag                # delete the old local tag
# git push origin :$tag          # delete the old remote tag
git tag $tag                   # create a new local tag
# else
#   echo git tag -d $tag                # delete the old local tag
#   echo git push origin :$tag          # delete the old remote tag
#   echo git tag $tag                   # create a new local tag
# fi
