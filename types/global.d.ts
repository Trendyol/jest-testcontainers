interface GlobalStartedTestContainer {
  stop(): Promise<any>;
}

declare namespace NodeJS {
  interface Global {
    __TESTCONTAINERS__: GlobalStartedTestContainer[];
  }
}
