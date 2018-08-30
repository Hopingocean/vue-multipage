'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

const glob = require('glob'); // glob是webpack安装时依赖的第三方模块，该模块允许使用*等符号，例如lib/*.js就是获取lib文件夹下的所有js后缀文件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 页面模板
const PAGE_PATH = path.resolve(__dirname, '../src/' + config.moduleName); // 取得相应的页面路径，可以再config中自定义配置模块名称moduleName
const merge = require('webpack-merge');


// 多入口配置（通过glob模块读取views中对应文件夹下的JS后缀文件，如果该文件存在，那么就作为入口处理）
exports.entries = function() {
  const entryFiles = glob.sync(PAGE_PATH + '/*/*.js');
  const map = {};
  entryFiles.forEach((filePath) => {
    const fileName = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
    map[fileName] = filePath;
  })
  return map;
}

// 多页面输出配置（读取moduleName下对应的html后缀文件）
exports.htmlPlugin = function() {
  const entryHtml = glob.sync(PAGE_PATH + '/*/*.html');
  const arr = [];
  entryHtml.forEach((filePath) => {
    const fileName = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
    let conf = {
      template: filePath, // 模板来源
      filename: fileName + '.html', // 文件名称
      chunks: ['manifest', 'vendor', fileName], // 页面模板需要的对应的JS脚本， 如果不加这行则每个页面都会引入所有的JS脚本
      inject: true,
    };
    if (process.env.NODE_ENV === 'production') {
      conf = merge(conf, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQutoes: true,
        },
        chunksSortMode: 'dependency',
      })
    }
    arr.push(new HtmlWebpackPlugin(conf));
  })
  return arr;
}

