var webpack = require('webpack');

module.exports = {
  devServer: {
    disableHostCheck: true,
  },
  chainWebpack: config => {
    config
      .plugin('ignore')
      .use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));

    //optimize debug
    // config
    //   .plugin('webpack-bundle-analyzer')
    //   .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
  },
};
