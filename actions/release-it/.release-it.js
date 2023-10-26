const version = "${version}";
const packageName = process.env.npm_package_name;
const monorepo = process.env.monorepo;
const branch_name = process.env.branch_name;
const scope = packageName.split("/")[1];

const releaseBranches = ["main", "master", "release/*"];

const checkRelease = (packageName) => {
  if (monorepo) {
    console.log("This is monorepo", packageName);
    console.log(branch_name);
    if (branch_name.indexOf("release") > -1 && branch_name.indexOf(packageName) < 0) {
      throw new Error(`Skipping release of ${packageName} for release branch ${branch_name}`);
      // return false;
    }
  }
  if (branch_name.indexOf("release") > -1) {
    // assuming release branches end with x.x.x
    if (branch_name.slice(-5, -2) !== version.slice(0, 3)) {
      throw new Error(`Cannot release version ${version} from release track ${branch_name}`);
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
    push: checkRelease(packageName),
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
