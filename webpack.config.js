const path = require('path');
const webpack = require('webpack');

const packageInfo = require('./package.json');

module.exports = {
  entry: path.join(__dirname, packageInfo.src),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `${packageInfo.name}.min.js`,
    library: packageInfo.name,
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
    new webpack.optimize.UglifyJsPlugin({ minimize: true, sourceMap: true }),
  ],
};
