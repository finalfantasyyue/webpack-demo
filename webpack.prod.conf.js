'use strict'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 从js里抽离出css，css单独是个文件
const OptimizeCssAssetsWebpackPlugin  = require('optimize-css-assets-webpack-plugin') // css压缩
const path = require('path')
const webpack = require('webpack')
module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
    search: './src/search.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name]_[chunkhash:8].js' // 编译时，只有改变的文件会重新打包，JS 没有 contenthash，只能从chunkhash和hadh里面选。但是hash对于js的含义是整个构建的文件指纹，每次构建有任何文件变了这个值都会变。所以js只能用chunkhash
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.(css|less)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader', // autoprefix 配合postcss-loader使用
            options: {
              plugins: () => [
                require('autoprefixer')
              ]
            }
          }
        ] // 从右到左执行，先用less-loader转换成css,再用css-loader把css打包到commonjs里，在通过style-loader将css写到style标签里
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[path][name]_[hash:8].[ext]',
              limit: 10240 // 图片小于10k时，会自动打包到js里
            }
          }
        ]
      },
      {
        test: /\.(woff2?|otf|ttf|eot|TTC)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]'
            }
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: './dist',
    // hot: true,  // 生产环境不需要热更新
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // template: './src/index.html',
      template: path.resolve(__dirname, './src/index.html'),
      chunks: ['index'], // 将index.css,index.js打包到index.html里
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'search.html',
      template: path.resolve(__dirname, './src/search.html'),
      chunks: ['search'], // 将search.js，search.css打包到search.html里
      inject: true
    }),
    new CleanWebpackPlugin(), // 每次重新打包时都会清空构建目录（dist）
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css'
    }), // 从js里抽离出css，css单独是个文件, css用contenthash
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    })
  ]
}