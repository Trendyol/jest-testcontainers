import { readFileSync } from "fs";
import NodeEnvironment from "jest-environment-node";
import { join } from "path";
import Script = jest.Script;

const GLOBAL_VARS_JSON_PATH = join(__dirname, "global.vars.json");

export class TestcontainersEnvironment extends NodeEnvironment {
  constructor(config: any) {
    super(config);
  }

  public async setup() {
    const globalVars = JSON.parse(readFileSync(GLOBAL_VARS_JSON_PATH, "utf-8"));
    const globalVarKeys = Object.keys(globalVars);

    globalVarKeys.forEach(globalVarKey => {
      this.global[globalVarKey] = globalVars[globalVarKey];
    });

    await super.setup();
  }

  public async teardown() {
    await super.teardown();
  }

  public runScript(script: Script) {
    return super.runScript(script);
  }
}

export default TestcontainersEnvironment;
