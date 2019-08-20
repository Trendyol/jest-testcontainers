import { Duration, TemporalUnit } from "node-duration";
import { Wait } from "testcontainers";
import { SingleContainerConfig } from "./config";
import { buildTestcontainer } from "./containers";

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
});
