var rules = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.js$/, loader: "source-map-loader" },
  { test: /\.glsl$/, loader: 'webpack-glsl-loader' },
];

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: __dirname + '/../../threeplot/nbextension/static',
    libraryTarget: 'amd'
  },
  module: {
    rules
  },
  devtool: 'source-map',
  externals: ['@jupyter-widgets/base', 'jupyter-datawidgets', 'jupyter-threejs', 'three'],
  resolve: {
    // Add '.ts' and '.glsl' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".js", ".glsl"]
  }
};
