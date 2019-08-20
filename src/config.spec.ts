import { JestTestcontainersConfig, parseConfig } from "./config";

describe("config", () => {
  describe("parseConfig", () => {
    it("should parse to object correctly", () => {
      // Arrange
      const firstContainer: any = {
        image: "first",
        wait: {
          text: "hello",
          type: "text"
        }
      };
      const secondContainer: any = {
        env: { hello: "world" },
        image: "second",
        ports: [6379, 7373],
        tag: "latest",
        wait: {
          timeout: 42,
          type: "ports"
        }
      };
      const objInput: any = { first: firstContainer, second: secondContainer };
      const expectedConfig: JestTestcontainersConfig = {
        first: {
          image: "first",
          wait: {
            text: "hello",
            type: "text"
          }
        },
        second: {
          env: { hello: "world" },
          image: "second",
          ports: [6379, 7373],
          tag: "latest",
          wait: {
            timeout: 42,
            type: "ports"
          }
        }
      };

      // Act
      const actualConfig = parseConfig(objInput);

      // Assert
      expect(actualConfig).toEqual(expectedConfig);
    });

    it("empty config should throw", () => {
      // Arrange
      const objInput: any = {};

      // Act
      const expectResult = expect(() => parseConfig(objInput));

      // Assert
      expectResult.toThrow();
    });

    it("without image config should throw", () => {
      // Arrange
      const objInput: any = { first: {} };

      // Act
      const expectResult = expect(() => parseConfig(objInput));

      // Assert
      expectResult.toThrow();
    });

    it("wrong tag should throw", () => {
      // Arrange
      const baseObjInput = {
        first: {
          image: "redis"
        }
      };
      const inputs = [5353, {}, []].map(tag => ({
        ...baseObjInput,
        first: { ...baseObjInput.first, tag }
      }));

      // Act
      const expectResults = inputs.map(input =>
        expect(() => parseConfig(input))
      );

      // Assert
      for (const expectResult of expectResults) {
        expectResult.toThrow();
      }
    });

    it("wrong ports should throw", () => {
      // Arrange
      const baseObjInput = {
        first: {
          image: "redis"
        }
      };
      const inputs = [5353, "5353", ["asd"]].map(ports => ({
        ...baseObjInput,
        first: { ...baseObjInput.first, ports }
      }));

      // Act
      const expectResults = inputs.map(input =>
        expect(() => parseConfig(input))
      );

      // Assert
      for (const expectResult of expectResults) {
        expectResult.toThrow();
      }
    });

    it("wrong env should throw", () => {
      // Arrange
      const baseObjInput = {
        first: {
          image: "redis"
        }
      };
      const inputs = ["asd", 2].map(env => ({
        ...baseObjInput,
        first: { ...baseObjInput.first, env }
      }));

      // Act
      const expectResults = inputs.map(input =>
        expect(() => parseConfig(input))
      );

      // Assert
      for (const expectResult of expectResults) {
        expectResult.toThrow();
      }
    });

    it("wrong wait should throw", () => {
      // Arrange
      const baseObjInput = {
        first: {
          image: "redis"
        }
      };
      const inputs = [
        "asd",
        2,
        { type: "asd" },
        { type: "ports" },
        { type: "ports", timeout: "xd" },
        { type: "text" }
      ].map(wait => ({
        ...baseObjInput,
        first: { ...baseObjInput.first, wait }
      }));

      // Act
      const expectResults = inputs.map(input =>
        expect(() => parseConfig(input))
      );

      // Assert
      for (const expectResult of expectResults) {
        expectResult.toThrow();
      }
    });
  });
});
