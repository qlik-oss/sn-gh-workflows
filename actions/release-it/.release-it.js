const version = "${version}";
let packageName = process.env.PNPM_PACKAGE_NAME;
const packageManager = process.env.package_manager;
const actionPath = process.env.action_path;
const monorepo = process.env.monorepo;
const specCommand = process.env.spec_command;
const API_KEY = process.env.API_KEY;

if (!packageName) {
  const fs = require("fs");
  const jsonString = fs.readFileSync("./package.json");
  const package = JSON.parse(jsonString);
  packageName = package.name;
}
const scope = packageName.split("/")[1];

let assets = "package.json ";
if (process.env.API_SPECIFICATION_PATH) {
  assets += process.env.API_SPECIFICATION_PATH;
} else if (specCommand === true || specCommand === "true") {
  assets += "api-spec/spec.json";
}
if (monorepo) {
  process.env.CURRENT_API_KEY = JSON.parse(API_KEY)[scope];
} else {
  process.env.CURRENT_API_KEY = API_KEY;
}

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
      "git clean -df",
      `if ${monorepo}; then mvm-update && git add mvm.lock || echo "Did not update mvm.lock"; fi`,
      `#!/bin/bash
      if [ -n "$(node ${actionPath}/check-version)" ]; then exit 1; fi`,
      `if ${specCommand}; then ${packageManager} run spec && ${packageManager} run build; fi`,
      `if ${specCommand}; then ${actionPath}/api-compliance.sh ${version}; fi`,
      `git add ${assets}"`,
    ],
    "after:git:release": ["git reset --hard", "git clean -df", `${packageManager} publish`],
  },
};
