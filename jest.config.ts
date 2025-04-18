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
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', '!**/node_modules/**', '!**/*.d.ts'],
}

export default createJestConfig(customJestConfig)
