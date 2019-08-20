import { writeFileSync } from "fs";
import { join } from "path";
import configReader, { JestTestcontainersConfig } from "./config";
import { startContainer, StartedContainerAndMetaInfo } from "./containers";

const GLOBAL_VARS_JSON_PATH = join(__dirname, "global.vars.json");
const createEnv = (name: string, key: string) =>
  `__TESTCONTAINERS_${name.toUpperCase()}_${key.toUpperCase()}__`;

type AllStartedContainersMetaInfo = {
  [key: string]: StartedContainerAndMetaInfo;
};
async function startAllContainers(
  config: JestTestcontainersConfig
): Promise<AllStartedContainersMetaInfo> {
  const containerKeys = Object.keys(config);
  const containerConfigs = Object.values(config);
  const startedContainersMetaInfos = await Promise.all(
    containerConfigs.map(startContainer)
  );

  return containerKeys.reduce(
    (acc, key, idx) => ({ ...acc, [key]: startedContainersMetaInfos[idx] }),
    {}
  );
}

function createGlobalVariablesFromMetaInfos(
  metaInfos: AllStartedContainersMetaInfo
) {
  const containerKeys = Object.keys(metaInfos);

  return containerKeys.reduce((acc: any, containerKey: string, idx: number) => {
    const { ip, portMappings } = metaInfos[containerKey];

    acc[createEnv(containerKey, "IP")] = ip;
    for (const [originalPort, boundPort] of portMappings.entries()) {
      acc[createEnv(containerKey, `PORT_${originalPort}`)] = boundPort;
    }

    return acc;
  }, {});
}

async function setup() {
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
