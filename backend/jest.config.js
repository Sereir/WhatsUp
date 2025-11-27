module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageReporters: ['none'],
  collectCoverageFrom: [
    // Only include files that have tests
    'src/controllers/authController.js',
    'src/controllers/contactController.js',
    'src/controllers/conversationController.js',
    'src/controllers/messageController.js',
    'src/controllers/notificationController.js',
    'src/controllers/sessionController.js',
    'src/controllers/syncController.js',
    'src/controllers/userController.js',
    'src/middleware/auth.middleware.js',
    'src/middleware/validation.middleware.js',
    'src/middleware/groupPermissions.middleware.js',
    'src/models/**/*.js',
    'src/routes/**/*.js',
    // Exclude
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 34,
      functions: 60,
      lines: 58,
      statements: 58
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  testTimeout: 30000,
  verbose: false,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
