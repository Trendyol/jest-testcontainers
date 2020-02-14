import { createClient, RedisClient } from "redis";
import { promisify } from "util";

const globals = (global as unknown) as any;

describe("redis example suite", () => {
  let redisClient: RedisClient;

  beforeAll(() => {
    const connectionUri = `redis://${globals.__TESTCONTAINERS_REDIS_IP__}:${globals.__TESTCONTAINERS_REDIS_PORT_6379__}`;
    redisClient = createClient(connectionUri);
  });

  afterAll(() => {
    redisClient.quit();
  });

  it("should set the container name correctly", () => {
    expect(globals.__TESTCONTAINERS_REDIS_NAME__).toEqual(
      "/unique-container-name"
    );
  });

  it("should write correctly", async () => {
    // Arrange
    const setAsync = promisify(redisClient.set).bind(redisClient);
    const value: number = 73;

    // Act
    const setResult = await setAsync("test", value.toString());

    // Assert
    expect(setResult).toEqual("OK");
  });

  it("should read the written value correctly", async () => {
    // Arrange
    const getAsync = promisify(redisClient.get).bind(redisClient);

    // Act
    const getResult = await getAsync("test");

    // Assert
    expect(getResult).toEqual("73");
  });
});
