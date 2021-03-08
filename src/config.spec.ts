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
        name: "name",
        wait: {
          timeout: 42,
          type: "ports"
        },
        bindMounts: [
          {
            source: "some path on host",
            target: "some path on container",
            mode: "ro"
          }
        ]
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
          name: "name",
          wait: {
            timeout: 42,
            type: "ports"
          },
          bindMounts: [
            {
              source: "some path on host",
              target: "some path on container",
              mode: "ro"
            }
          ]
        }
      };

      // Act
      const actualConfig = parseConfig(objInput);

      // Assert
      expect(actualConfig).toEqual(expectedConfig);
    });

    it("should parse to docker compose options correctly", () => {
      // Arrange
      const objInput: any = {
        dockerCompose: {
          composeFilePath: ".",
          composeFile: "docker-compose.yml",
          startupTimeout: 1000
        }
      };
      const expectedConfig: JestTestcontainersConfig = {
        dockerCompose: {
          composeFilePath: ".",
          composeFile: "docker-compose.yml",
          startupTimeout: 1000
        }
      };

      // Act
      const actualConfig = parseConfig(objInput);

      // Assert
      expect(actualConfig).toEqual(expectedConfig);
    });

    it("should throw when trying to combine dockerCompose with other options", () => {
      // Arrange
      const objInput: any = {
        dockerCompose: {
          composeFilePath: ".",
          composeFile: "docker-compose.yml",
          startupTimeout: 1000
        },
        first: {
          image: "first",
          wait: {
            text: "hello",
            type: "text"
          }
        }
      };

      // Act
      const expectResult = expect(() => parseConfig(objInput));

      // Assert
      expectResult.toThrow();
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

    it("wrong name should throw", () => {
      // Arrange
      const baseObjInput = {
        first: {
          image: "redis"
        }
      };
      const inputs = [5353, {}, []].map(name => ({
        ...baseObjInput,
        first: { ...baseObjInput.first, name }
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

    it("wrong bind mounts should throw", () => {
      // Arrange
      const baseObjInput = {
        first: {
          image: "redis"
        }
      };
      const inputs = [
        null,
        42,
        "a weird string mount, like something:somevalue",
        {
          source: "a bind mount out of an array",
          target: "a bind mount out of an array",
          mode: "rw"
        },
        ["an array of non-object bind mounts"],
        [
          {
            source: "a bind mount with just source path"
          }
        ],
        [
          {
            target: "a bind mount with just target path"
          }
        ],
        [
          {
            mode: "a bind mount with just mode"
          }
        ],
        [
          {
            source: "a bind mount with just source and target paths",
            target: "a bind mount with just source and target paths"
          }
        ]
      ].map(bindMounts => ({
        ...baseObjInput,
        first: { ...baseObjInput.first, bindMounts }
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
