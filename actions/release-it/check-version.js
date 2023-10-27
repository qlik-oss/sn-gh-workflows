const fs = require("fs");

console.log("in the check version", process.env.version);
const jsonString = fs.readFileSync("./package.json");
const packageJson = JSON.parse(jsonString);

console.log("version from package.json", packageJson.version);
