# vue-multipage

> 基于vue-cli构建多页面开发脚手架

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```
## 配置教程
1. 在build/utils.js文件中添加以下代码
<pre>
  const glob = require('glob'); // glob是webpack安装时依赖的第三方模块，该模块允许使用*等符号，例如lib/*.js就是获取lib文件夹下的所有js后缀文件
  const HtmlWebpackPlugin = require('html-webpack-plugin'); // 页面模板
  // 取得相应的页面路径，可以再config中自定义配置模块名称moduleName，此处config.moduleName为自定义参数，也可以定义为'views'即可
  const PAGE_PATH = path.resolve(__dirname, '../src/' + config.moduleName);
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
</pre>

2. 在build/webpack.base.conf.js中修改如下：

<pre>
  // 修改前
  module.exports = {
    entry: {
      app: './src/main.js'
    },
  }

  // 修改后
  module.exports = {
    entry: utils.entries(),
  }
</pre>

3. 在build/webpack.dev.conf.js中修改如下：

<pre>
  // 修改前
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]

  // 修改后
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    // 注释默认的入口
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: 'index.html',
    //   inject: true
    // }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ].concat(utils.htmlPlugin()) // 复制多页面配置
</pre>

4. 修改build/webpack.prod.conf.js如下：

<pre>
  // 修改前
  plugins: [
    ...
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    ...
  ]

  // 修改后
  plugins: [
    // 注释默认的入口打包插件
    // new HtmlWebpackPlugin({
    //   filename: config.build.index,
    //   template: 'index.html',
    //   inject: true,
    //   minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeAttributeQuotes: true
    //     // more options:
    //     // https://github.com/kangax/html-minifier#options-quick-reference
    //   },
    //   // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    //   chunksSortMode: 'dependency'
    // }),
  ].concat(utils.htmlPlugin()) // 复制utils文件中的多页面配置
</pre>

5. 注：如果插件安装不全，按照提示安装对应插件即可