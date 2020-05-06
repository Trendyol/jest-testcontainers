import { StartedContainerAndMetaInfo } from "./containers";

async function teardown() {
  const allStartedContainers: StartedContainerAndMetaInfo[] = (global as any)
    .__TESTCONTAINERS__;

  await Promise.all(
    allStartedContainers.map((container: any) => container.stop())
  );
}

module.exports = teardown;
export default teardown;
