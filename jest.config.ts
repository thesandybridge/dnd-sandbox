// jest.config.ts
import nextJest from 'next/jest'
import type { Config } from 'jest'

const createJestConfig = nextJest({ dir: './' })

const customJestConfig: Config = {
  testEnvironment: 'jsdom',
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/', // ✅ Ignore Playwright E2E tests
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/*.d.ts',
    '!e2e/**', // ✅ Optionally exclude E2E files from coverage collection
  ],
}

export default createJestConfig(customJestConfig)
