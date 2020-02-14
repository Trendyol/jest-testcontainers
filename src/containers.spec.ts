import { Duration, TemporalUnit } from "node-duration";
import { Wait } from "testcontainers";
import {
  StartedTestContainer,
  TestContainer
} from "testcontainers/dist/test-container";
import { JestTestcontainersConfig, SingleContainerConfig } from "./config";
import {
  AllStartedContainersAndMetaInfo,
  buildTestcontainer,
  getMetaInfo,
  startAllContainers,
  startContainer,
  StartedContainerAndMetaInfo
} from "./containers";

describe("containers", () => {
  describe("buildTestcontainer", () => {
    it("should create simple container with image only", () => {
      // Arrange
      const config: SingleContainerConfig = {
        image: "redis"
      };

      // Act
      const actualContainer: any = buildTestcontainer(config);

      // Assert
      expect(actualContainer.image).toEqual("redis");
      expect(actualContainer.tag).toEqual("latest");
      expect(actualContainer.ports).toEqual([]);
      expect(actualContainer.env).toEqual({});
      expect(actualContainer.waitStrategy).toEqual(undefined);
      expect(actualContainer.startupTimeout).toEqual(
        new Duration(60000, TemporalUnit.MILLISECONDS)
      );
    });

    it("should set tag correctly", () => {
      // Arrange
      const config: SingleContainerConfig = {
        image: "redis",
        tag: "5.0.5"
      };

      // Act
      const actualContainer: any = buildTestcontainer(config);

      // Assert
      expect(actualContainer.image).toEqual("redis");
      expect(actualContainer.tag).toEqual("5.0.5");
      expect(actualContainer.ports).toEqual([]);
      expect(actualContainer.env).toEqual({});
      expect(actualContainer.waitStrategy).toEqual(undefined);
      expect(actualContainer.startupTimeout).toEqual(
        new Duration(60000, TemporalUnit.MILLISECONDS)
      );
    });

    it("should set ports correctly", () => {
      // Arrange
      const config: SingleContainerConfig = {
        image: "redis",
        ports: [6379]
      };

      // Act
      const actualContainer: any = buildTestcontainer(config);

      // Assert
      expect(actualContainer.image).toEqual("redis");
      expect(actualContainer.tag).toEqual("latest");
      expect(actualContainer.ports).toEqual([6379]);
      expect(actualContainer.env).toEqual({});
      expect(actualContainer.waitStrategy).toEqual(undefined);
      expect(actualContainer.startupTimeout).toEqual(
        new Duration(60000, TemporalUnit.MILLISECONDS)
      );
    });

    it("should set name correctly", () => {
      // Arrange
      const config: SingleContainerConfig = {
        image: "redis",
        ports: [6379],
        name: "container-name"
      };

      // Act
      const actualContainer: any = buildTestcontainer(config);

      // Assert
      expect(actualContainer.image).toEqual("redis");
      expect(actualContainer.tag).toEqual("latest");
      expect(actualContainer.ports).toEqual([6379]);
      expect(actualContainer.name).toEqual("container-name");
      expect(actualContainer.env).toEqual({});
      expect(actualContainer.waitStrategy).toEqual(undefined);
      expect(actualContainer.startupTimeout).toEqual(
        new Duration(60000, TemporalUnit.MILLISECONDS)
      );
    });

    it("should set env correctly", () => {
      // Arrange
      const config: SingleContainerConfig = {
        env: {
          hello: "world"
        },
        image: "redis"
      };

      // Act
      const actualContainer: any = buildTestcontainer(config);

      // Assert
      expect(actualContainer.image).toEqual("redis");
      expect(actualContainer.tag).toEqual("latest");
      expect(actualContainer.ports).toEqual([]);
      expect(actualContainer.env).toEqual({ hello: "world" });
      expect(actualContainer.waitStrategy).toEqual(undefined);
      expect(actualContainer.startupTimeout).toEqual(
        new Duration(60000, TemporalUnit.MILLISECONDS)
      );
    });

    it("should port wait strategy correctly", () => {
      // Arrange
      const config: SingleContainerConfig = {
        image: "redis",
        wait: {
          timeout: 30,
          type: "ports"
        }
      };

      // Act
      const actualContainer: any = buildTestcontainer(config);

      // Assert
      expect(actualContainer.image).toEqual("redis");
      expect(actualContainer.tag).toEqual("latest");
      expect(actualContainer.ports).toEqual([]);
      expect(actualContainer.env).toEqual({});
      expect(actualContainer.waitStrategy).toEqual(undefined);
      expect(actualContainer.startupTimeout).toEqual(
        new Duration(30, TemporalUnit.SECONDS)
      );
    });

    it("should text wait strategy correctly", () => {
      // Arrange
      const config: SingleContainerConfig = {
        image: "redis",
        wait: {
          text: "hello, world",
          type: "text"
        }
      };

      // Act
      const actualContainer: any = buildTestcontainer(config);

      // Assert
      expect(actualContainer.image).toEqual("redis");
      expect(actualContainer.tag).toEqual("latest");
      expect(actualContainer.ports).toEqual([]);
      expect(actualContainer.env).toEqual({});
      expect(actualContainer.waitStrategy).toEqual(
        Wait.forLogMessage("hello, world")
      );
      expect(actualContainer.startupTimeout).toEqual(
        new Duration(60000, TemporalUnit.MILLISECONDS)
      );
    });
  });

  describe("getMetaInfo", () => {
    it("should work with no ports", () => {
      // Arrange
      const host = "localhost";
      const name = "container-name";
      const startedContainer: StartedTestContainer = ({
        getContainerIpAddress: jest.fn(() => host),
        getName: jest.fn(() => name)
      } as unknown) as StartedTestContainer;
      const expectedMetaInfo: StartedContainerAndMetaInfo = {
        name,
        container: startedContainer,
        ip: host,
        portMappings: new Map<number, number>()
      };

      // Act
      const actualMetaInfo = getMetaInfo(startedContainer);

      // Assert
      expect(actualMetaInfo).toEqual(expectedMetaInfo);
    });

    it("should work with empty ports", () => {
      // Arrange
      const host = "localhost";
      const name = "container-name";
      const ports: number[] = [];
      const boundPorts = new Map<number, number>();
      const startedContainer: StartedTestContainer = ({
        getContainerIpAddress: jest.fn(() => host),
        getName: jest.fn(() => name),
        getMappedPort: jest.fn(port => boundPorts.get(port))
      } as unknown) as StartedTestContainer;
      const expectedMetaInfo: StartedContainerAndMetaInfo = {
        name,
        container: startedContainer,
        ip: host,
        portMappings: boundPorts
      };

      // Act
      const actualMetaInfo = getMetaInfo(startedContainer, ports);

      // Assert
      expect(actualMetaInfo).toEqual(expectedMetaInfo);
    });

    it("should work with ports", () => {
      // Arrange
      const host = "localhost";
      const name = "container-name";
      const ports = [1, 3, 4];
      const boundPorts = new Map<number, number>([
        [1, 2],
        [3, 4]
      ]);
      const startedContainer: StartedTestContainer = ({
        getContainerIpAddress: jest.fn(() => host),
        getName: jest.fn(() => name),
        getMappedPort: jest.fn(port => boundPorts.get(port))
      } as unknown) as StartedTestContainer;
      const expectedMetaInfo: StartedContainerAndMetaInfo = {
        name,
        container: startedContainer,
        ip: host,
        portMappings: boundPorts
      };

      // Act
      const actualMetaInfo = getMetaInfo(startedContainer, ports);

      // Assert
      expect(actualMetaInfo).toEqual(expectedMetaInfo);
    });
  });

  describe("startContainer", () => {
    it("should call builder and getter functions", async () => {
      // Arrange
      const ports = [1];
      const boundPorts = new Map<number, number>([[1, 2]]);
      const startedContainer = ({} as unknown) as StartedTestContainer;
      const container: TestContainer = ({
        start: jest.fn(() => Promise.resolve(startedContainer))
      } as unknown) as TestContainer;
      const containerBuilderFn: any = jest.fn(() => container);
      const expectedMetaResult: StartedContainerAndMetaInfo = {
        container: startedContainer,
        ip: "localhost",
        name: "container-name",
        portMappings: boundPorts
      };
      const getMetaInfoFn: any = jest.fn(() => expectedMetaResult);
      const config: SingleContainerConfig = {
        image: "test",
        ports,
        tag: "latest"
      };

      // Act
      const actualMetaResult = await startContainer(
        config,
        containerBuilderFn,
        getMetaInfoFn
      );

      // Assert
      expect(actualMetaResult).toEqual(expectedMetaResult);
      expect(getMetaInfoFn).toHaveBeenCalledWith(startedContainer, ports);
      expect(container.start).toHaveBeenCalledWith();
      expect(containerBuilderFn).toHaveBeenCalledWith(config);
    });
  });

  describe("startAllContainers", () => {
    it("should call starter function", async () => {
      // Arrange
      const config: JestTestcontainersConfig = {
        rabbit: { image: "rabbit" },
        redis: { image: "redis" }
      };
      const container = (null as unknown) as StartedTestContainer;
      const redisPortMappings = new Map<number, number>([[1, 2]]);
      const rabbitPortMappings = new Map<number, number>([[3, 4]]);
      const infos: AllStartedContainersAndMetaInfo = {
        rabbit: {
          name: "rabbit",
          container,
          ip: "localhost",
          portMappings: rabbitPortMappings
        },
        redis: {
          name: "redis",
          container,
          ip: "localhost",
          portMappings: redisPortMappings
        }
      };
      const startContainerFn: any = jest.fn(
        (cfg: SingleContainerConfig) => infos[cfg.image]
      );

      // Act
      const allStartedContainerAndMetaInfo = await startAllContainers(
        config,
        startContainerFn
      );

      // Assert
      expect(allStartedContainerAndMetaInfo).toEqual(infos);
      expect(startContainerFn).toHaveBeenCalledWith(config.rabbit);
      expect(startContainerFn).toHaveBeenCalledWith(config.redis);
    });
  });
});
