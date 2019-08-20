module.exports = {
  redis: {
    image: 'redis',
    tag: '5.0.5',
    ports: [6379],
    wait: {
      type: 'ports',
      timeout: 5
    }
  }
};
