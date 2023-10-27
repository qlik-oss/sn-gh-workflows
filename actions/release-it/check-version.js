const fs = require("fs");

const jsonString = fs.readFileSync("./package.json");
const packageJson = JSON.parse(jsonString);

console.log("version from package.json", packageJson.version);
console.log("branch name", process.env.branch_name);
