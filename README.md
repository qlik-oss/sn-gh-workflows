# sn-gh-workflows

A collection of [GitHub actions reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) that can be used by a supernova component.

## Setup

1. To use this workflow in a repo add this workflow

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
    uses: qlik-oss/sn-gh-workflows/.github/workflows/build.yaml@v2
    secrets: inherit
    with:
      release: ${{ inputs.release || false}}
      api_specification_path: path-to-spec-file
      monorepo: true # Only when setting up a monorepository
      package_manager: pnpm # pnpm is the default since v2
```

This will trigger a build for pull requests to main, every new commit on main and manually by the user.

2. In order to upload unit test results to codeclimate you will need to add the test reporter id for your repository as a secret: `CC_TEST_REPORTER_ID`
3. Add the API key for API compliance as secret: `API_KEY`. For monorepositories this should be a json object containing the different API keys for the individual packages. E.g.

```json
{
  "sn-table": "API_KEY_SN_TABLE",
  "sn-pivot-table": "API_KEY_SN_PIVOT_TABLE"
}
```

4. Make sure to add the correct path to your api specification file. The workflow will use `api-spec/spec.json` as default

### Trigger a release

This workflow uses [release-it](https://github.com/release-it/release-it) to fully automate version management and package publishing. To trigger a release, manually run the workflow on a release branch and set release to true.
