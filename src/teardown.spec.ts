import teardown from "./teardown";
const CONTAINERS_GLOBAL_VARIABLE_KEY = "__TESTCONTAINERS__";

describe("teardown", () => {
  describe("container stop logic", () => {
    it("should stop all containers registered in the global variable", async () => {
      // Arrange
      const mocks = [...new Array(5)].map(() => ({
        stop: jest.fn(() => Promise.resolve())
      }));
      // @ts-ignore
      global[CONTAINERS_GLOBAL_VARIABLE_KEY] = mocks;

      // Act
      await teardown();

      // Assert
      for (const { stop: mockCallback } of mocks) {
        expect(mockCallback.mock.calls.length).toBe(1);
      }
    });
  });
});
