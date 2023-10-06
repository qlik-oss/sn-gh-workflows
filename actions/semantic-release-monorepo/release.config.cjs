const config = {
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "semantic-release-lerna",
      { generateNotes: true, latch: "none", rootVersion: false },
    ],
    "@semantic-release/changelog",
    [
      "@semantic-release/git",
      {
        assets: [
          "CHANGELOG.md",
          "lerna.json",
          "package.json",
          "package-lock.json",
          "packages/*/package.json",
          "packages/*/package-lock.json",
        ],
      },
    ],
  ],
};

module.exports = config;
