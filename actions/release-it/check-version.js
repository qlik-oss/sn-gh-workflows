const { parseArgs } = require("node:util");

const { values: args } = parseArgs({
  options: {
    version: {
      type: "string",
      default: "the default",
    },
  },
});

console.log(args.version);
