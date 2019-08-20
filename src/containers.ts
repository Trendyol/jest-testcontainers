import { Duration, TemporalUnit } from "node-duration";
import { GenericContainer, Wait } from "testcontainers";
import { TestContainer } from "testcontainers/dist/test-container";
import {
  EnvironmentVariableMap,
  SingleContainerConfig,
  WaitConfig
} from "./config";

const addWaitStrategyToContainer = (waitStrategy?: WaitConfig) => (
  container: TestContainer
): TestContainer => {
  if (waitStrategy === undefined) {
    return container;
  }
  if (waitStrategy.type === "ports") {
    return container.withStartupTimeout(
      new Duration(waitStrategy.timeout, TemporalUnit.SECONDS)
    );
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
    (newContainer, key) => newContainer.withEnv(key, env[key]),
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

export function buildTestcontainer(
  containerConfig: SingleContainerConfig
): TestContainer {
  const { image, tag, ports, env, wait } = containerConfig;

  return [
    addPortsToContainer(ports),
    addEnvironmentVariablesToContainer(env),
    addWaitStrategyToContainer(wait)
  ].reduce((res, func) => func(res), new GenericContainer(
    image,
    tag
  ) as TestContainer);
}
