# Frequently Asked Questions
### How does it run in a pipeline?
A detailed explanation of this will be done. To summarize; you can either use *Docker inside Docker* and set the *DOCKER_HOST* to the docker engine. Or you can bind the docker socket to your container when running the integration tests. By default, this should run without any problems with CI services that use DIND like Travis CI.
### Usage with typescript
If you are writing your tests with your Typescript, you don't have to choose between this library and [ts-jest](https://github.com/kulshekhar/ts-jest).

Create a *preset.js*. 
```js
const ts_preset = require('ts-jest/jest-preset');
const testcontainers_preset = require('@trendyol/jest-testcontainers/jest-preset');

module.exports = {
	...ts_preset,
	...testcontainers_preset,
};
```

and use this file in your *jest.config.js*:
```js
module.exports = {
  preset: './preset.js',
};
```

See [examples/02-typescript-redis](./examples/02-typescript-redis) for a working example.
