# jest-testcontainers
Jest preset for running docker containers with your tests. Primary purpose is to make it possible to use any database in integration tests. Since it uses docker images, custom database images with different plugins/configurations can be used in the integration tests. Using [testcontainers-node](https://github.com/testcontainers/testcontainers-node) under the hood. Inspired by [@shelf/jest-mongodb](https://github.com/shelfio/jest-mongodb).

[![Build Status](https://travis-ci.org/Trendyol/jest-testcontainers.svg?branch=master)](https://travis-ci.org/testcontainers/testcontainers-node)
[![npm version](https://badge.fury.io/js/%40trendyol%2Fjest-testcontainers.svg)](https://badge.fury.io/js/%40trendyol%2Fjest-testcontainers)

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
    tag: 'alpine3.12',
    ports: [6379],
    env: {
      EXAMPLE: 'env',
    },
    wait: {
      type: 'text',
      text: 'Ready to accept connections'
    }
  },
//   more: {
//     image: 'any-docker-image', // postgresql, mongodb, neo4j etc.
//     ports: [1234, 4567], // ports to make accessible in tests
//   },
};
```

### Connect To Containers
Every containers IP and Port info is registered to global variables to be used by your tests.
```js
const redis = require('redis');
const { promisify } = require('util');

describe('testcontainers example suite', () => {
  let redisClient;

  beforeAll(() => {
    const redisConnectionURI = `redis://${global.__TESTCONTAINERS_REDIS_IP__}:${global.__TESTCONTAINERS_REDIS_PORT_6379__}`;
    redisClient = redis.createClient(redisConnectionURI);
    
    // if you have declared multiple containers, they will be available to access as well. e.g.
    // `global.__TESTCONTAINERS_${CONFIG_KEY}_IP__`
    // `global.__TESTCONTAINERS_${CONFIG_KEY}_PORT_${CONFIG_PORT}__`
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

## Watch mode support
Starting with version 2.0.0 containers will not be stopped if Jest is started in watch mode. This greatly improves development productivity if your containers have a slow startup time (ex. Elasticsearch). This comes with the price that you have to be mindful that containers will be reused between watch test executions and you need to do proper cleanup in your after hooks.

If you want to disable this behavior you can set the `JEST_TESTCONTAINERS_RESTART_ON_WATCH` environment variable.

> Wondering what will happen when those containers are not stopped when Jest is exited - [testcontainer's ryuk](https://github.com/testcontainers/testcontainers-node#ryuk) will take care of them.

## Examples
Working example projects can be found and tried out in [examples](./examples) folder. To run the redis only example, you can clone this project, and run `npm run build && npm run example:redis` at the root folder. It will first build the project with the latest code, and then run the example.

## License
This project is licensed under the MIT License
