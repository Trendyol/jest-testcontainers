# Documentation

## Container Configuration
```js
// you can have multiple containers that gets started with your test
export interface JestTestcontainersConfig {
  // each container needs to have a unique key
  // the IP and PORTS for this container will be registered with this container key
  // for example, with a *containerKey* of redis, you would end up with
  // global.__TESTCONTAINERS_REDIS_IP__ and global.__TESTCONTAINERS_REDIS_PORT_XXXX__
  // variables
  [containerKey: string]: SingleContainerConfig;
}

export interface SingleContainerConfig {
  image: string;
  tag?: string;
  // for each port, a host port will be mount randomly
  // and the random port number will be registered to the global variable using the containerKey and original port number
  // so if you put [6379] here, and you have a *containerKey* of redis, you will have
  // global.__TESTCONTAINERS_REDIS_PORT_6379__
  // set to the random host port that the currently running container is bound to for 6379
  ports?: number[];
  // environment variables can be set for the container. this is a key/value string map 
  env?: EnvironmentVariableMap;
  // when to start your tests? how to make sure container is running?
  // see below for options
  wait?: WaitConfig;
}

export type EnvironmentVariableMap = { [key: string]: string };
export type WaitConfig = PortsWaitConfig | TextWaitConfig;

// wait for host and internal ports to be connectable
// default behaviour is this
interface PortsWaitConfig {
  type: "ports";
  // how many seconds to wait for the sockets to be available before we timeout?
  // default is 60 seconds
  timeout: number;
}

// wait until you see a text in the console output of the container
interface TextWaitConfig {
  type: "text";
  // part of the string that will be seen on the console output line
  text: string;
}
```
