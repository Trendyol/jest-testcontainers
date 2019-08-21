# jest-testcontainers
Jest preset for running docker containers with your tests. Primary purpose is to make it possible to use any database in integration tests. Since it uses docker images, custom database images with different plugins/configurations can be used in the integration tests. Using [testcontainers-node](https://github.com/testcontainers/testcontainers-node) under the hood. Inspired by [@shelf/jest-mongodb](https://github.com/shelfio/jest-mongodb).

## Usage
### Install
Docker should be installed on your system. If running inside a CI pipeline, see [FAQ.md](./FAQ.md).

```npm install --save-dev @trendyol/jest-testcontainers```

### Edit Jest Config
On your `jest.config.js` add the project as the preset.

```js
module.exports = {
  preset: '@trendyol/jest-testcontainers'
};
```

### Declare Containers To Run
Create a file called `jest-testcontainers-config.js` and put it to root of your project, where you run *npm test*. If you would like to put this file somewhere else, you can use the *JEST_TESTCONTAINERS_CONFIG_PATH* environment variable to define a relative or absolute path. A sample configuration file;

```js
module.exports = {
  redis: {
    image: 'redis',
    ports: [6379],
  },
  neo4j: { 
    // can put custom images as well
    image: 'neo4j',
    tag: '3.5.7',
    ports: [7687],
    env: {
      NEO4J_ACCEPT_LICENSE_AGREEMENT: 'yes',
      NEO4J_AUTH: 'none',
    },
    wait: {
        type: 'text',
        text: 'Remote interface available at',
    },
  },
};
```

### Connect To Containers
Every containers IP and Port info is registered to global variables to be used by your tests.
```js
const redis = require('redis');
const { promisify } = require('util');

describe('redis example suite', () => {
  let redisClient;

  beforeAll(() => {
    const redisConnectionURI = `redis://${global.__TESTCONTAINERS_REDIS_IP__}:${global.__TESTCONTAINERS_REDIS_PORT_6379__}`;
    redisClient = redis.createClient(redisConnectionURI);
    
    // const neo4jConnectionURI = `bolt://${this.global.__TESTCONTAINERS_NEO4J_IP__}:${this.global.__TESTCONTAINERS_NEO4J_PORT_7687__}`;
    // use the neo4j connection uri to create a client
  });

  afterAll(() => {
    redisClient.quit();
  });
  
  it('write should be ok', async () => {
    // Arrange
    const setAsync = promisify(redisClient.set).bind(redisClient);

    // Act
    const setResult = await setAsync('test', 73);

    // Assert
    expect(setResult).toEqual('OK');
  });
});
```

## Documentation
Detailed documentation of the `jest-testcontainers-config.js` can be found at [DOC.md](./DOC.md).

## Examples
Working example projects can be found and tried out in [examples](./examples) folder. To run the redis only example, you can clone this project, and run `npm run build && npm run example:redis` at the root folder. It will first build the project with the latest code, and then run the example.

## License
This project is licensed under the MIT License
