const version = "${version}";
const packageName = process.env.npm_package_name;
const scope = packageName.split("/")[1];

const releaseBranches = ["main", "master", "release/**"];

// Check if branch conditions are met

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
    tagName: `${packageName}-v${version}`,
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
    "before:git:release": ["mvm-update", `node ${process.env.action_path}/check-version`, "git add --all"],
    "after:git:release": ["npm publish"],
  },
};
