module.exports = {
  redis: {
    image: 'redis',
    tag: '5.0.5',
    ports: [6379],
    name: 'unique-container-name',
    wait: {
      type: 'ports',
      timeout: 5,
    },
  },
};
