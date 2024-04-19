const version = "${version}";
let packageName = process.env.PNPM_PACKAGE_NAME;
const actionPath = process.env.action_path;
const monorepo = process.env.monorepo;
const specCommand = process.env.spec_command;
const API_KEY = process.env.API_KEY;

const fs = require("fs");
const jsonString = fs.readFileSync("./package.json");
const package = JSON.parse(jsonString);

if (!packageName) {
  packageName = package.name;
}

if (package.private === true || package.private === "true") {
  process.exit();
}
const scope = packageName.split("/")[1];

let assets = "package.json ";
if (process.env.API_SPECIFICATION_PATH) {
  assets += process.env.API_SPECIFICATION_PATH;
} else if (specCommand === true || specCommand === "true") {
  assets += "api-spec/spec.json";
}

let tagName = `v${version}`;
if (monorepo === true || monorepo === "true") {
  tagName = `${packageName}-${tagName}`;
  process.env.CURRENT_API_KEY = JSON.parse(API_KEY)[scope];
} else {
  process.env.CURRENT_API_KEY = API_KEY;
}

const releaseBranches = ["main", "master", "release/**", "alpha", "beta"];

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
      `#!/bin/bash
      if [ -n "$(node ${actionPath}/check-version)" ]; then exit 1; fi`,
      `if ${specCommand}; then pnpm run spec && pnpm run build; fi`,
      `git add ${assets}`,
    ],
    "after:git:release": [
      `${actionPath}/api-compliance.sh ${tagName}`,
      "git reset --hard",
      "git clean -df",
      "git status",
      "pnpm publish",
    ],
  },
};
