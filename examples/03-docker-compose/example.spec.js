const redis = require('redis');
const { promisify } = require('util');

describe('docker compose example suite', () => {
  let redisClient;

  beforeAll(() => {
    const connectionUri = `redis://${global.__TESTCONTAINERS_REDIS_IP__}:${global.__TESTCONTAINERS_REDIS_PORT_6379__}`;
    redisClient = redis.createClient(connectionUri);
  });

  afterAll(() => {
    redisClient.quit();
  });

  it("should set a container name", () => {
    expect(global.__TESTCONTAINERS_REDIS_NAME__).toBeDefined();
  });

  it('should write correctly', async () => {
    // Arrange
    const setAsync = promisify(redisClient.set).bind(redisClient);

    // Act
    const setResult = await setAsync('test', 73);

    // Assert
    expect(setResult).toEqual('OK');
  });

  it('should read the written value correctly', async () => {
    // Arrange
    const getAsync = promisify(redisClient.get).bind(redisClient);

    // Act
    const getResult = await getAsync('test');

    // Assert
    expect(getResult).toEqual('73');
  });
});
