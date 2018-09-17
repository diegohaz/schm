module.exports = {
  rootDir: __dirname,
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  projects: ["<rootDir>/packages/*/jest.config.js"]
};
