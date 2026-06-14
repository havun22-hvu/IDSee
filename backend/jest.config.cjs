/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  // auth.ts instantiates a module-level PrismaClient (open handle); tests
  // touch no DB, so force a clean exit rather than leak the connection.
  forceExit: true,
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // Integration tests need a DB + their own config (jest.integration.config.cjs).
  testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
  // Source uses NodeNext-style .js import extensions; strip them so the
  // CommonJS test build resolves the real .ts files.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};
