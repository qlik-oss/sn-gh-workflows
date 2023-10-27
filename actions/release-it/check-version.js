const fs = require("fs");

const jsonString = fs.readFileSync("./package.json");
const packageJson = JSON.parse(jsonString);

const branch = process.env.branch_name;
const newVersion = packageJson.version;
const { monorepo } = process.env || false;
const packageName = process.env.npm_package_name;
const scope = packageName.split("/")[1];

if (monorepo) {
  if (branch.indexOf("release") > -1 && branch.indexOf(scope) < 0) {
    console.log(`Skipping release of ${scope} since it should not be released from branch ${branch}`);
  }
}

if (branch.slice(-5, -2) !== newVersion.slice(0, 3)) {
  console.log(`You are releasing from a patch release track. Release ${newVersion} is not allowed on branch ${branch}`);
}
