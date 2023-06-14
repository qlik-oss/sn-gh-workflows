# sn-gh-workflows
A collection of [GitHub actions reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) that can be used by a supernova component. 

## Setup
To use this workflow in a repo add this workflow
```yaml
name: Build
on:
  workflow_dispatch:
    inputs:
      release:
        type: boolean
        required: true
        default: false

  pull_request:
    branches:
      - main

  push:
    branches:
      - main

jobs:
  build:
    uses: qlik-oss/sn-gh-workflows/.github/workflows/build.yaml@v1
    secrets: inherit
    with:
      release: ${{ inputs.release || false}}
```
This will trigger a build for pull requests to main, every new commit on main and manually by the user.

### Trigger a release
This workflow uses [semantic-release](https://github.com/semantic-release/semantic-release) to fully automate version management and package publishing. To trigger a release, manually run the workflow on a release branch and set release to true. 
