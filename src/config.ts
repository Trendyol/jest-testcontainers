import cwd from "cwd";
import { existsSync } from "fs";
import { isAbsolute, resolve } from "path";

class JestTestcontainersConfigError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = this.constructor.name;
  }
}

export interface JestTestcontainersConfig {
  [key: string]: SingleContainerConfig;
}

interface SingleContainerConfig {
  image: string;
  tag?: string;
  ports?: number[];
  env?: { [key: string]: string };
  wait?: PortsWaitConfig | TextWaitConfig;
}

interface PortsWaitConfig {
  type: "ports";
  timeout: number;
}

interface TextWaitConfig {
  type: "text";
  text: string;
}

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

function assertContainerConfigIsValid({
  image,
  tag,
  ports,
  wait,
  env
}: any): void {
  if (!image || image.constructor !== String || image.trim().length <= 0) {
    throw new JestTestcontainersConfigError("an image should be presented");
  }
  if (
    tag !== undefined &&
    (tag.constructor !== String || image.trim().length <= 0)
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
  if (env !== undefined && env.constructor !== Object) {
    throw new JestTestcontainersConfigError(
      "env should be an object of env key to value"
    );
  }

  assertWaitConfig(wait);
}

function parseContainerConfig(config: any): JestTestcontainersConfig {
  assertContainerConfigIsValid(config);
  const { image, tag, ports, env, wait } = config;
  const parsed = { image, tag, ports, env, wait };

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
