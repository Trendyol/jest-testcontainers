async function teardown() {
  await Promise.all(
    global.__TESTCONTAINERS__.map(container => container.stop())
  );
}

module.exports = teardown;
export default teardown;
