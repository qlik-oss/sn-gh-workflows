const assets = ["package.json"];
if (process.env.API_SPECIFICATION_PATH) {
  assets.push(process.env.API_SPECIFICATION_PATH);
} else {
  assets.push("api-spec/spec.json");
}

const config = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    [
      "@semantic-release/exec",
      {
        prepareCmd: "yarn spec && yarn build",
        successCmd: "$GITHUB_ACTION_PATH/api-compliance.sh ${nextRelease.version}",
      },
    ],
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets,
      },
    ],
  ],
};

module.exports = config;
