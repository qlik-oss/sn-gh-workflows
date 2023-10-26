import { Plugin } from "release-it";

class ReleaseBranchPlugin extends Plugin {
  beforeRelease() {
    const { monorepo, scope } = this.options;
    if (monorepo) {
      console.log("This is the scope from plugin", scope);
    }
  }
}

export default ReleaseBranchPlugin;
