import {
  DockerComposeEnvironment,
  GenericContainer,
  Wait
} from "testcontainers";
import {
  StartedTestContainer,
  TestContainer
} from "testcontainers/dist/test-container";
import {
  DockerComposeConfig,
  EnvironmentVariableMap,
  JestTestcontainersConfig,
  SingleContainerConfig,
  WaitConfig,
  BindConfig
} from "./config";

const addWaitStrategyToContainer = (waitStrategy?: WaitConfig) => (
  container: TestContainer
): TestContainer => {
  if (waitStrategy === undefined) {
    return container;
  }
  if (waitStrategy.type === "ports") {
    return container.withStartupTimeout(waitStrategy.timeout * 1000);
  }
  if (waitStrategy.type === "text") {
    return container.withWaitStrategy(Wait.forLogMessage(waitStrategy.text));
  }
  throw new Error("unknown wait strategy for container");
};

const addEnvironmentVariablesToContainer = (env?: EnvironmentVariableMap) => (
  container: TestContainer
): TestContainer => {
  if (env === undefined) {
    return container;
  }
  return Object.keys(env).reduce(
    (newContainer, key) => newContainer.withEnvironment({ [key]: env[key] }),
    container
  );
};

const addPortsToContainer = (ports?: number[]) => (
  container: TestContainer
): TestContainer => {
  if (!Array.isArray(ports) || ports.length <= 0) {
    return container;
  }
  return container.withExposedPorts(...ports);
};

const addBindsToContainer = (bindMounts?: BindConfig[]) => (
  container: TestContainer
): TestContainer => {
  if (!bindMounts) return container;
  container.withBindMounts(
    bindMounts.map(bindMount => ({
      source: bindMount.source,
      target: bindMount.target,
      mode: bindMount.mode
    }))
  );
  return container;
};

const addNameToContainer = (name?: string) => (
  container: GenericContainer
): TestContainer => {
  if (name === undefined) {
    return container;
  }
  return container.withName(name);
};

export function buildTestcontainer(
  containerConfig: SingleContainerConfig
): TestContainer {
  const { image, tag, ports, name, env, wait, bindMounts } = containerConfig;
  const sanitizedTag = tag ?? "latest";
  const container = new GenericContainer(`${image}:${sanitizedTag}`);

  return [
    addPortsToContainer(ports),
    addEnvironmentVariablesToContainer(env),
    addWaitStrategyToContainer(wait),
    addBindsToContainer(bindMounts)
  ].reduce<TestContainer>(
    (res, func) => func(res),
    addNameToContainer(name)(container)
  );
}

export function buildDockerComposeEnvironment(
  dockerComposeConfig: DockerComposeConfig
): DockerComposeEnvironment {
  const environment = new DockerComposeEnvironment(
    dockerComposeConfig.composeFilePath,
    dockerComposeConfig.composeFile
  );
  if (dockerComposeConfig?.startupTimeout) {
    return environment.withStartupTimeout(dockerComposeConfig.startupTimeout);
  }
  return environment;
}

export interface StartedContainerAndMetaInfo {
  ip: string;
  name: string;
  portMappings: Map<number, number>;
  container: StartedTestContainer;
}

export function getMetaInfo(
  container: StartedTestContainer,
  ports?: number[]
): StartedContainerAndMetaInfo {
  const portMappings = new Map<number, number>();

  return {
    container,
    ip: container.getHost(),
    name: container.getName(),
    portMappings: (ports || []).reduce(
      (mapping, p: number) =>
        container.getMappedPort(p)
          ? mapping.set(p, container.getMappedPort(p))
          : mapping,
      portMappings
    )
  };
}

export async function startContainer(
  containerConfig: SingleContainerConfig,
  containerBuilderFn: typeof buildTestcontainer = buildTestcontainer,
  infoGetterFn: typeof getMetaInfo = getMetaInfo
): Promise<StartedContainerAndMetaInfo> {
  const container = containerBuilderFn(containerConfig);
  const startedContainer = await container.start();

  return infoGetterFn(startedContainer, containerConfig.ports);
}

export async function startDockerComposeContainers(
  dockerComposeConfig: DockerComposeConfig,
  dockerComposeBuilderFn: typeof buildDockerComposeEnvironment = buildDockerComposeEnvironment,
  infoGetterFn: typeof getMetaInfo = getMetaInfo
): Promise<AllStartedContainersAndMetaInfo> {
  const environment = dockerComposeBuilderFn(dockerComposeConfig);
  const startedEnvironment = await environment.up();
  // This is a private property, so the only way to access it is to ignore the
  // typescript compilation error.
  // @ts-ignore
  const containers = startedEnvironment.startedGenericContainers;
  return Object.keys(containers).reduce(
    (acc, containerName) => ({
      ...acc,
      [containerName]: infoGetterFn(
        containers[containerName],
        Array.from(containers[containerName].boundPorts.ports.keys())
      )
    }),
    {}
  );
}

export type AllStartedContainersAndMetaInfo = {
  [key: string]: StartedContainerAndMetaInfo;
};
export async function startAllContainers(
  config: JestTestcontainersConfig,
  startContainerFn: typeof startContainer = startContainer,
  startDockerComposeContainersFn: typeof startDockerComposeContainers = startDockerComposeContainers
): Promise<AllStartedContainersAndMetaInfo> {
  if ("dockerCompose" in config) {
    return startDockerComposeContainersFn(
      config.dockerCompose as DockerComposeConfig
    );
  }
  const containerKeys = Object.keys(config);
  const containerConfigs = Object.values(config);
  const startedContainersMetaInfos = await Promise.all(
    containerConfigs.map(containerConfig => startContainerFn(containerConfig))
  );

  return containerKeys.reduce(
    (acc, key, idx) => ({ ...acc, [key]: startedContainersMetaInfos[idx] }),
    {}
  );
}
