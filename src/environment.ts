import { readFileSync } from "fs";
import NodeEnvironment from "jest-environment-node";
import { join } from "path";
import { Script } from "vm";

const GLOBAL_VARS_JSON_PATH = join(__dirname, "global.vars.json");

export function setGlobalsWithJsonString(globals: any, jsonString: string) {
  const globalVars = JSON.parse(jsonString);
  const globalVarKeys = Object.keys(globalVars);

  globalVarKeys.forEach(globalVarKey => {
    // @ts-ignore
    globals[globalVarKey] = globalVars[globalVarKey];
  });
}

export class TestcontainersEnvironment extends NodeEnvironment {
  constructor(config: any) {
    super(config);
  }

  public async setup() {
    const globalVarsJsonString = readFileSync(GLOBAL_VARS_JSON_PATH, "utf-8");

    setGlobalsWithJsonString(this.global, globalVarsJsonString);
    await super.setup();
  }

  public async teardown() {
    await super.teardown();
  }

  public runScript<T = any>(script: Script): T | null {
    return super.runScript(script);
  }
}

export default TestcontainersEnvironment;
