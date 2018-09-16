module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: "defaults"
        }
      }
    ],
    "@babel/preset-flow"
  ],
  plugins: [
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-export-default-from"
  ]
};
