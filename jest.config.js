module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/assetsTransformer.js',
    '\\.(css|less)$': '<rootDir>/assetsTransformer.js',
    '\\.(svg)$': '<rootDir>/__mocks__/svgrMock.js'
  },
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/index.js'],
  coveragePathIgnorePatterns: ['/node_modules/', 'extension.js'],
  setupFilesAfterEnv: ['jest-webextension-mock', './setupJest.js']
}
