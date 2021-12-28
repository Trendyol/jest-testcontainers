import cwd from "cwd";
import { existsSync } from "fs";
import { isAbsolute, resolve } from "path";

class JestTestcontainersConfigError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = this.constructor.name;
  }
}

export type EnvironmentVariableMap = { [key: string]: string };
export type WaitConfig = PortsWaitConfig | TextWaitConfig;

export type DockerComposeConfig = {
  composeFilePath: string;
  composeFile: string;
  startupTimeout?: number;
};

type DockerComposeContainersConfig = {
  dockerCompose?: DockerComposeConfig;
};

type MultipleContainerConfig = {
  [key: string]: SingleContainerConfig;
};

export type JestTestcontainersConfig =
  | DockerComposeContainersConfig
  | MultipleContainerConfig;

export interface SingleContainerConfig {
  image: string;
  tag?: string;
  ports?: number[];
  name?: string;
  env?: EnvironmentVariableMap;
  wait?: WaitConfig;
  bindMounts?: BindConfig[];
}

interface PortsWaitConfig {
  type: "ports";
  timeout: number;
}

interface TextWaitConfig {
  type: "text";
  text: string;
}

export interface BindConfig {
  source: string;
  target: string;
  mode: BindMode;
}

// https://github.com/testcontainers/testcontainers-node/blob/v2.7.0/src/docker-client.ts#L48
export type BindMode = "ro" | "rw";

function assertWaitConfig(wait: any): void {
  if (wait === undefined) {
    return;
  }
  if (!["ports", "text"].includes(wait.type)) {
    throw new JestTestcontainersConfigError("wait can be ports or text");
  }
  if (wait && wait.type === "ports" && !Number.isInteger(wait.timeout)) {
    throw new JestTestcontainersConfigError(
      "wait type ports requires timeout field as integer"
    );
  }
  if (wait && wait.type === "text" && !wait.text) {
    throw new JestTestcontainersConfigError(
      "wait type text requires a text to wait for"
    );
  }
}

function assertBindConfig(bindMount: any): void {
  if (!bindMount.source) {
    throw new JestTestcontainersConfigError(
      "a bind is missing the source (host's) path"
    );
  }
  if (!bindMount.target) {
    throw new JestTestcontainersConfigError(
      "a bind is missing the target (container's) path"
    );
  }
  if (!bindMount.mode) {
    throw new JestTestcontainersConfigError(
      'a bind is missing the mode ("rw" or "ro")'
    );
  }
}

function assertContainerConfigIsValid({
  image,
  tag,
  ports,
  name,
  wait,
  env,
  bindMounts
}: any): void {
  if (!image || image.constructor !== String || image.trim().length <= 0) {
    throw new JestTestcontainersConfigError("an image should be presented");
  }
  if (
    tag !== undefined &&
    (tag.constructor !== String || tag.trim().length <= 0)
  ) {
    throw new JestTestcontainersConfigError(
      "tag is optional but should be string"
    );
  }
  if (
    ports !== undefined &&
    (ports.constructor !== Array || !ports.every(Number.isInteger))
  ) {
    throw new JestTestcontainersConfigError(
      "ports should be a list of numbers"
    );
  }
  if (
    name !== undefined &&
    (name.constructor !== String || name.trim().length <= 0)
  ) {
    throw new JestTestcontainersConfigError(
      "name is optional but should be string"
    );
  }
  if (env !== undefined && env.constructor !== Object) {
    throw new JestTestcontainersConfigError(
      "env should be an object of env key to value"
    );
  }
  if (
    bindMounts !== undefined &&
    (bindMounts.constructor !== Array ||
      bindMounts.some((bindMount: any) => bindMount.constructor !== Object))
  ) {
    throw new JestTestcontainersConfigError(
      "binds should be a list of bind objects"
    );
  }

  assertWaitConfig(wait);
  if (bindMounts) bindMounts.every(assertBindConfig);
}

function parseContainerConfig(config: any): JestTestcontainersConfig {
  assertContainerConfigIsValid(config);
  const { image, tag, ports, name, env, wait, bindMounts } = config;
  const parsed = { image, tag, ports, name, env, wait, bindMounts };

  return Object.keys(parsed).reduce(
    (acc, key) => (key !== undefined ? { ...acc, [key]: config[key] } : acc),
    {}
  ) as JestTestcontainersConfig;
}

function getConfigPath(envValue?: string): string {
  if (!envValue) {
    return resolve(cwd(), "jest-testcontainers-config.js");
  }
  if (isAbsolute(envValue)) {
    return envValue;
  }
  return resolve(cwd(), envValue);
}

function readJsFile(file: string): any {
  try {
    return require(file);
  } catch (e) {
    throw new JestTestcontainersConfigError(
      // @ts-ignore
      `could not read file ${file} as js file: ${e.message}`
    );
  }
}

function readConfig(envValue?: string): JestTestcontainersConfig {
  const configPath = getConfigPath(envValue);
  if (!existsSync(configPath)) {
    throw new JestTestcontainersConfigError(
      `config file could not be found at: ${configPath}`
    );
  }

  return readJsFile(configPath);
}

export function parseConfig(containerConfigs: any) {
  if (!containerConfigs || Object.keys(containerConfigs).length < 1) {
    throw new JestTestcontainersConfigError(
      "testcontainers config can not be empty"
    );
  }

  if ("dockerCompose" in containerConfigs) {
    if (Object.keys(containerConfigs).length !== 1) {
      throw new JestTestcontainersConfigError(
        "testcontainers config cannot contain other images when using 'dockerCompose' option"
      );
    }
    return containerConfigs;
  }

  return Object.keys(containerConfigs).reduce(
    (acc, key) => ({
      ...acc,
      [key]: parseContainerConfig(containerConfigs[key])
    }),
    {}
  );
}

export default (): JestTestcontainersConfig =>
  parseConfig(readConfig(process.env.JEST_TESTCONTAINERS_CONFIG_PATH));
