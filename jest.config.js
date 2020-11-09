module.exports = {
  coverageThreshold: {
    global: {
      statements: 96.43 // TODO
    }
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/controllers/parse-image-info.js', // TODO
    '<rootDir>/lib/(formatted-log|prometheus|report).js', // TODO
    '<rootDir>/api/' // TODO
  ],
  roots: ['<rootDir>/test/']
}
