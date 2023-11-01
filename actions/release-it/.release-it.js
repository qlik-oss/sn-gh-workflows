const version = "${version}";
const packageName = process.env.npm_package_name;
const monorepo = process.env.monorepo;
const scope = packageName.split("/")[1];

const releaseBranches = ["main", "master", "release/**"];

module.exports = {
  plugins: {
    "@release-it/conventional-changelog": {
      path: ".",
      infile: "CHANGELOG.md",
      preset: "conventionalcommits",
      gitRawCommitsOpts: {
        path: ".",
      },
    },
  },
  git: {
    push: true,
    tagName: monorepo ? `${packageName}-v${version}` : `v${version}`,
    commitsPath: ".",
    commitMessage: `chore(${scope}): released version v${version} [no ci]`,
    requireCommits: true,
    requireCommitsFail: false,
    requireBranch: releaseBranches,
  },
  npm: {
    publish: false,
    versionArgs: ["--workspaces false"],
  },
  github: {
    release: true,
    releaseName: `${packageName}-v${version}`,
  },
  hooks: {
    "before:git:release": [
      `if ${monorepo}; then mvm-update; fi`,
      `#!/bin/bash
      if [ -n "$(node ${process.env.action_path}/check-version)" ]; then exit 1; fi`,
      "git add --all",
    ],
    "after:git:release": ["npm publish"],
  },
};
