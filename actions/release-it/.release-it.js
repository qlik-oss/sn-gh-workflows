const version = "${version}";
const packageName = process.env.npm_package_name;
const monorepo = process.env.monorepo;
const branch_name = process.env.branch_name;
const scope = packageName.split("/")[1];

const releaseBranches = ["main", "master", "release/**"];

const checkReleaseBranch = (newVersion) => {
  // Check if branch conditions are met
  if (monorepo) {
    if (branch_name.indexOf("release") > -1 && branch_name.indexOf(scope) < 0) {
      console.log(`Skipping release of ${scope} since it should not be released from branch ${branch_name}`);
      process.exit(0);
    }
  }
  if (branch_name.indexOf("release") > -1) {
    console.log(branch_name, newVersion);
    console.log(branch_name.slice(-5, -2), newVersion.slice(0, 3));
    // assuming release branches end with x.x.x
    if (branch_name.slice(-5, -2) !== newVersion.slice(0, 3)) {
      console.log(`Skipping release of ${scope}. Only patch release are allowed from ${branch_name}`);
      process.exit(0);
    }
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
    push: checkReleaseBranch(version),
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
