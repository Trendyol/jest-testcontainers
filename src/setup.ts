import { writeFileSync } from "fs";
import { join } from "path";
import { GenericContainer, Wait } from "testcontainers";
import { StartedTestContainer } from "testcontainers/dist/test-container";
import configReader from "./config";

const GLOBAL_VARS_JSON_PATH = join(__dirname, "global.vars.json");
const createEnv = (name: string, key: string) =>
  `__TESTCONTAINERS_${name.toUpperCase()}_${key.toUpperCase()}__`;

async function startContainer({
  image,
  tag,
  port,
  ports,
  wait,
  env = {}
}: any): Promise<StartedTestContainer> {
  const { type: waitType, second: waitSecond, text: waitText } = wait;
  const allPorts = port ? [port] : ports;
  const textStrategy =
    waitType === "text" ? Wait.forLogMessage(waitText) : undefined;

  const containerBootstrap = Object.keys(env).reduce(
    (bootstrap, key) => bootstrap.withEnv(key, env[key]),
    textStrategy
      ? new GenericContainer(image, tag).withWaitStrategy(textStrategy)
      : new GenericContainer(image, tag).withStartupTimeout(waitSecond)
  );

  return containerBootstrap.withExposedPorts(...allPorts).start();
}

function getMetaInfo(container: StartedTestContainer, { port, ports }: any) {
  const allPorts = port ? [port] : ports;

  return {
    ip: container.getContainerIpAddress(),
    portMappings: allPorts.reduce(
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
        containerConfigs[containerKey]
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
