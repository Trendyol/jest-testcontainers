import { StartedContainerAndMetaInfo } from "./containers";

async function teardown(opts: any) {
  if (
    !process.env.JEST_TESTCONTAINERS_RESTART_ON_WATCH &&
    (opts.watch || opts.watchAll)
  ) {
    return;
  }

  const allStartedContainers: StartedContainerAndMetaInfo[] = (global as any)
    .__TESTCONTAINERS__;

  await Promise.all(
    allStartedContainers.map((container: any) => container.stop())
  );
}

module.exports = teardown;
export default teardown;
