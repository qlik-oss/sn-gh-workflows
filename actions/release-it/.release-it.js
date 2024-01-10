const version = "${version}";
const packageName = process.env.npm_package_name;
const packageManager = process.env.package_manager;
const actionPath = process.env.action_path;
const monorepo = process.env.monorepo;
const scope = packageName.split("/")[1];

const releaseBranches = ["main", "master", "release/**", "alpha", "beta"];

let tagName = `v${version}`;
if (monorepo === true || monorepo === "true") {
  tagName = `${packageName}-${tagName}`;
}

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
    tagName,
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
    releaseName: tagName,
  },
  hooks: {
    "before:git:release": [
      `if ${monorepo}; then mvm-update; fi`,
      `#!/bin/bash
      if [ -n "$(node ${actionPath}/check-version)" ]; then exit 1; fi`,
      `${packageManager} spec && ${packageManager} build`,
      `${actionPath}/api-compliance.sh ${version}`,
      "git add --all",
    ],
    "after:git:release": [`${packageManager} publish`],
  },
};
