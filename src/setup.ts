import { writeFileSync } from "fs";
import { join } from "path";
import { StartedTestContainer } from "testcontainers/dist/test-container";
import configReader, { SingleContainerConfig } from "./config";
import { buildTestcontainer } from "./containers";

const GLOBAL_VARS_JSON_PATH = join(__dirname, "global.vars.json");
const createEnv = (name: string, key: string) =>
  `__TESTCONTAINERS_${name.toUpperCase()}_${key.toUpperCase()}__`;

async function startContainer(
  containerConfig: SingleContainerConfig
): Promise<StartedTestContainer> {
  const container = buildTestcontainer(containerConfig);
  return container.start();
}

export function getMetaInfo(container: StartedTestContainer, ports?: number[]) {
  return {
    ip: container.getContainerIpAddress(),
    portMappings: (ports || []).reduce(
      (acc: any, p: number) => ({ ...acc, [p]: container.getMappedPort(p) }),
      {}
    )
  };
}

async function setup() {
  const containerConfigs = configReader();
  const containerKeys = Object.keys(containerConfigs);
  const containers = await Promise.all(
    containerKeys.map(containerKey =>
      startContainer(containerConfigs[containerKey])
    )
  );
  const globalEnv = containerKeys.reduce(
    (acc: any, containerKey: string, idx: number) => {
      const container = containers[idx];
      const { ip, portMappings } = getMetaInfo(
        container,
        containerConfigs[containerKey].ports
      );

      acc[createEnv(containerKey, "IP")] = ip;
      Object.keys(portMappings).forEach(originalPort => {
        acc[createEnv(containerKey, `PORT_${originalPort}`)] =
          portMappings[originalPort];
      });

      return acc;
    },
    {}
  );

  writeFileSync(GLOBAL_VARS_JSON_PATH, JSON.stringify(globalEnv), "utf-8");
  global.__TESTCONTAINERS__ = containers as GlobalStartedTestContainer[];
}

module.exports = setup;
export default setup;
