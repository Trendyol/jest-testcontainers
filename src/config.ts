import cwd from "cwd";
import { existsSync } from "fs";
import { resolve } from "path";

function readJsFile(file: string) {
  try {
    return require(file);
  } catch (e) {
    throw new Error(`could not read file ${file} as js file: ${e.message}`);
  }
}

function parseContainerConfig({ image, tag, port, ports, wait, env }: any) {
  if (!image || image.constructor !== String || image.trim().length <= 0) {
    throw new Error("an image should be presented");
  }
  if (
    tag !== undefined &&
    (tag.constructor !== String || image.trim().length <= 0)
  ) {
    throw new Error("tag is optional but should be string");
  }
  if (
    !Number.isInteger(port) &&
    (!ports || ports.constructor !== Array || !ports.every(Number.isInteger))
  ) {
    throw new Error("you should either give a port or list of ports");
  }
  if (!wait || !["second", "text"].includes(wait.type)) {
    throw new Error("wait can be second or text");
  }
  if (wait.type === "second" && !Number.isInteger(wait.second)) {
    throw new Error("wait type second requires second field as integer");
  }
  if (wait.type === "text" && !wait.text) {
    throw new Error("wait type text requires a text to wait for");
  }
  if (env !== undefined && env.constructor !== Object) {
    throw new Error("env should be an object of env key to value");
  }

  return { image, tag, port, ports, wait, env };
}

function readConfig(): any {
  const configPath =
    process.env.JEST_TESTCONTAINERS_CONFIG_PATH ||
    resolve(cwd(), "jest-testcontainers-config.js");
  if (!existsSync(configPath)) {
    throw new Error(`config file could not be found at: ${configPath}`);
  }
  const containerConfigs = readJsFile(configPath);
  if (!containerConfigs || Object.keys(containerConfigs).length < 1) {
    throw new Error("testcontainers config can not be empty");
  }

  return Object.keys(containerConfigs).reduce(
    (acc, key) => ({
      ...acc,
      [key]: parseContainerConfig(containerConfigs[key])
    }),
    {}
  );
}

export default readConfig;
