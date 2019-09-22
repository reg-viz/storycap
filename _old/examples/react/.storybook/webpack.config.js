const { createDefaultWebpackConfig } = require('@storybook/core/dist/server/config/webpack.config.default.js');

module.exports = (baseConfig, env) => {
  const config = createDefaultWebpackConfig(baseConfig, env);

  config.module.rules.push({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'ts-loader'
  });

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
