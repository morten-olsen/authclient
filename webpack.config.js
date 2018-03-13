const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const packageInfo = require('./package.json');

module.exports = {
  entry: path.join(__dirname, packageInfo.src),
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `${packageInfo.name}.min.js`,
    library: 'AuthClient',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
    }],
  },
  externals: packageInfo.externals || {},
  plugins: [
    new UglifyJSPlugin({ sourceMap: true }),
  ],
};
