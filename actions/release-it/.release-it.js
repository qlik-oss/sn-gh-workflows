const version = "${version}";
const packageName = process.env.npm_package_name;
const monorepo = process.env.monorepo;
const branch_name = process.env.branch_name;
const scope = packageName.split("/")[1];

const releaseBranches = ["main", "master", "release/*"];

const checkRelease = () => {
  if (monorepo) {
    console.log("This is monorepo");
    console.log(branch_name);
  }
  return true;
};

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
    push: checkRelease(),
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
    "before:git:release": ["mvm-update", "git add --all"],
    "after:git:release": ["npm publish"],
  },
};
