'use strict'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const glob = require('glob')
// 多页面打包，利用glob
const setMPA = () => {
  const entry = {}
  const htmlWebpackPlugin = []
  const entryFiles = glob.sync(path.resolve(__dirname, './src/*/index.js')) // 获取src/*/index.js
  Object.keys(entryFiles)
    .map(index => {
      const matchPageName = entryFiles[index].match(/src\/(.*)\/index\.js/) // 匹配index,search
      const pageName = matchPageName && matchPageName[1]
      entry[pageName] = entryFiles[index]
      htmlWebpackPlugin.push(
        new HtmlWebpackPlugin({
          filename: `${pageName}.html`,
          // template: './src/index.html',
          template: path.resolve(__dirname, `./src/${pageName}/index.html`),
          chunks: [pageName], // 将index.css,index.js打包到index.html里
          inject: true,
          minify: { // 压缩内嵌到html里面的js,css
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
          }
        })
      )
    })
  return {
    entry,
    htmlWebpackPlugin
  }
}
const { entry, htmlWebpackPlugin } = setMPA()
module.exports = {
  mode: 'development',
  entry: entry,
  // entry: {
  //   index: './src/index.js',
  //   search: './src/search.js'
  // },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.(css|less)$/,
        use: ['style-loader', 'css-loader', 'less-loader'] // 从右到左执行，先用less-loader转换成css,再用css-loader把css打包到commonjs里，在通过style-loader将css写到style标签里
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[path][name].[ext]',
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
    hot: true,
    open: true
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   // template: './src/index.html',
    //   template: path.resolve(__dirname, './src/index.html'),
    //   chunks: ['index'], // 将index.css,index.js打包到index.html里
    //   inject: true,
    //   minify: { // 压缩内嵌到html里面的js,css
    //     collapseWhitespace: true,
    //     minifyCSS: true,
    //     minifyJS: true
    //   }
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'search.html',
    //   template: path.resolve(__dirname, './src/search.html'),
    //   chunks: ['search'], // 将search.js，search.css打包到search.html里
    //   inject: true
    // }),
    new CleanWebpackPlugin() // 每次重新打包时都会清空构建目录（dist）
    // new webpack.HotModuleReplacementPlugin() // 热更新配合HotModuleReplacementPlugin一起使用, hot: true,会自动引入
  ].concat(htmlWebpackPlugin),
  devtool: 'cheap-module-eval-source-map'
}