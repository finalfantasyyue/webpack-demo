'use strict'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 从js里抽离出css，css单独是个文件
const OptimizeCssAssetsWebpackPlugin  = require('optimize-css-assets-webpack-plugin') // css压缩
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin') // 提取公共资源，减少打包体积，但需要在入口index.html手动引入
const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
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
          chunks: ['common', 'vendors', pageName], // 将index.css,index.js打包到index.html里
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
  mode: 'production',
  entry: entry,
  // entry: {
  //   index: './src/index.js',
  //   search: './src/search.js'
  // },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name]_[chunkhash:8].js' // 编译时，只有改变的文件打包完成后文件hash会变，JS 没有 contenthash，只能从chunkhash和hash里面选。但是hash对于js的含义是整个构建的文件指纹，每次构建有任何文件变了这个值都会变。所以js只能用chunkhash
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
          {
            loader: 'px2rem-loader',
            options: {
              remUni: 75, // 1rem为75px对应750设计稿
              remPrecision: 8 // 精确度为8位小数
            }
          },
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
    /*new HtmlWebpackPlugin({
      filename: 'index.html',
      // template: './src/index.html',
      template: path.resolve(__dirname, './src/index.html'),
      chunks: ['index'], // 将index.css,index.js打包到index.html里
      inject: true,
      minify: { // 压缩内嵌到html里面的js,css
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'search.html',
      template: path.resolve(__dirname, './src/search.html'),
      chunks: ['search'], // 将search.js，search.css打包到search.html里
      inject: true
    }),*/
    new CleanWebpackPlugin(), // 每次重新打包时都会清空构建目录（dist）
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css'
    }), // 从js里抽离出css，css单独是个文件, css用contenthash
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    }),
    // new HtmlWebpackExternalsPlugin({
    //   externals: [
    //     {
    //       module: 'react',
    //       // entry: 'https://cdnjs.cloudflare.com/ajax/libs/react/16.13.1/umd/react.production.min.js'
    //       entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js'
    //     },
    //     {
    //       module: 'react-dom',
    //       // entry: 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.13.1/umd/react-dom.production.min.js'
    //       entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js'
    //     }
    //   ]
    // })
  ].concat(htmlWebpackPlugin),
  optimization: {
    splitChunks: {
      minSize: 0, // 当文件大于30k时单独打包成common.js
      cacheGroups: {
        commons: {
          name: "common",
          chunks: "all",
          minChunks: 2, // 引用两次及以上会打包成common.js文件
        },
        vendors: {
          test: /(react|react-dom)/, // 建议仅包括您的核心框架和实用程序
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  devtool: 'cheap-module-source-map'
}