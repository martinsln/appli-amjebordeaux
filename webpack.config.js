const path = require('path');
const webpack = require('webpack');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({ ...env, projectRoot: __dirname }, argv);

  // Ensure Expo Router knows where the app directory lives when bundling for web.
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(path.resolve(__dirname, 'app')),
    })
  );

  return config;
};
