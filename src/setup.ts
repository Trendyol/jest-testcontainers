import { writeFileSync } from "fs";
import { join } from "path";
import configReader from "./config";
import {
  AllStartedContainersAndMetaInfo,
  startAllContainers
} from "./containers";

const GLOBAL_VARS_JSON_PATH = join(__dirname, "global.vars.json");
const createEnv = (name: string, key: string) =>
  `__TESTCONTAINERS_${name.toUpperCase()}_${key.toUpperCase()}__`;

function createGlobalVariablesFromMetaInfos(
  metaInfos: AllStartedContainersAndMetaInfo
) {
  const containerKeys = Object.keys(metaInfos);

  return containerKeys.reduce((acc: any, containerKey: string, idx: number) => {
    const { ip, name, portMappings } = metaInfos[containerKey];

    acc[createEnv(containerKey, "IP")] = ip;
    acc[createEnv(containerKey, "NAME")] = name;
    for (const [originalPort, boundPort] of portMappings.entries()) {
      acc[createEnv(containerKey, `PORT_${originalPort}`)] = boundPort;
    }

    return acc;
  }, {});
}

async function setup(opts: any) {
  if ((opts.watch || opts.watchAll) && global.__TESTCONTAINERS__) {
    return;
  }

  const jestTestcontainersConfig = configReader();
  const allStartedContainersMetaInfo = await startAllContainers(
    jestTestcontainersConfig
  );
  const globalEnv = createGlobalVariablesFromMetaInfos(
    allStartedContainersMetaInfo
  );

  writeFileSync(GLOBAL_VARS_JSON_PATH, JSON.stringify(globalEnv), "utf-8");
  global.__TESTCONTAINERS__ = Object.values(allStartedContainersMetaInfo).map(
    ({ container }) => container
  ) as GlobalStartedTestContainer[];
}

module.exports = setup;
export default setup;
