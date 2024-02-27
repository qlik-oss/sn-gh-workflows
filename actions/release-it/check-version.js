/* eslint-disable no-console */
const fs = require("fs");

const jsonString = fs.readFileSync("./package.json");
const packageJson = JSON.parse(jsonString);

const branch = process.env.branch_name || "";
const { version } = packageJson;
const { monorepo } = process.env || false;
const packageName = process.env.npm_package_name || "";
const scope = packageName.split("/")[1];

const versionRegex = /(\d+\.)?(\d+\.)?(x|\d+)$/;

if (!version) {
  console.log("Could not perform version checks because of missing version in package.json");
}

const branchVersion = branch.match(versionRegex);
const packageVersion = version.match(versionRegex);

if (monorepo) {
  if (branch.indexOf("release") > -1 && branch.indexOf(scope) < 0) {
    console.log(`Skipping release of ${scope} since it should not be released from branch ${branch}`);
  }
}

if (branch.indexOf("release") > -1) {
  if (branchVersion[1] !== packageVersion[1]) {
    console.log(
      `You are releasing from a patch release track. Releasing major release ${version} is not allowed on branch ${branch}`,
    );
  }
  if (branchVersion[2] !== packageVersion[2]) {
    console.log(
      `You are releasing from a patch release track. Releasing minor release ${version} is not allowed on branch ${branch}`,
    );
  }
}
