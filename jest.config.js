module.exports = {
  coverageThreshold: {
    global: {
      statements: 100
    }
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/controllers/(generate-image|generate-template).js',
    '<rootDir>/lib/formatted-log.js'
  ],
  roots: ['<rootDir>/test/']
}
