import { setGlobalsWithJsonString } from "./environment";

describe("environment", () => {
  describe("setGlobalsWithJsonString", () => {
    it("should set variables to global correctly", () => {
      // Arrange
      const variables: { [key: string]: string } = {
        a: "b",
        hello: "world"
      };
      const globals: any = {};
      const jsonString = JSON.stringify(variables);

      // Act
      setGlobalsWithJsonString(globals, jsonString);

      // Assert
      for (const key of Object.keys(variables)) {
        expect(globals[key]).toEqual(variables[key]);
      }
    });
  });
});
