module.exports = {
  testEnvironment: "node",
  testMatch: [
    "**/src/__tests__/**/*.js?(x)",
    "**/src/__tests__/**/*.ts?(x)", // Include TypeScript files
    "**/src/?(*.)+(spec|test).js?(x)",
    "**/src/?(*.)+(spec|test).ts?(x)", // Include TypeScript files
  ],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
};
