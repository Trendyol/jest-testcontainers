import teardown from "./teardown";
const CONTAINERS_GLOBAL_VARIABLE_KEY = "__TESTCONTAINERS__";

describe("teardown", () => {
  describe("container stop logic", () => {
    it("should stop all containers registered in the global variable", async () => {
      // Arrange
      const mocks = [...new Array(5)].map(() => ({
        stop: jest.fn(() => Promise.resolve())
      }));

      (global as any)[CONTAINERS_GLOBAL_VARIABLE_KEY] = mocks;

      // Act
      await teardown({});

      // Assert
      for (const { stop: mockCallback } of mocks) {
        expect(mockCallback.mock.calls.length).toBe(1);
      }
    });

    it("should not call stop if started in watch mode", async () => {
      // Arrange
      const mocks = [...new Array(5)].map(() => ({
        stop: jest.fn(() => Promise.resolve())
      }));

      (global as any)[CONTAINERS_GLOBAL_VARIABLE_KEY] = mocks;

      // Act
      await teardown({ watch: true });

      // Assert
      for (const { stop: mockCallback } of mocks) {
        expect(mockCallback.mock.calls.length).toBe(0);
      }
    });
  });
});
