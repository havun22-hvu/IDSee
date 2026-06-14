/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  forceExit: true,
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  setupFiles: ['<rootDir>/tests/integration/setEnv.cjs'],
  globalSetup: '<rootDir>/tests/integration/globalSetup.cjs',
  globalTeardown: '<rootDir>/tests/integration/globalTeardown.cjs',
  // Integration tests share one DB copy — run serially to avoid interference.
  maxWorkers: 1,
};
