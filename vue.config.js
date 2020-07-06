// vue.config.js
const path = require('path')
const webpack = require('webpack')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// 生产环境根目录
// const PROD_BASE_URL = '/CloudLink'
const PROD_BASE_URL = '/'

function resolvePath (dir) {
  return path.join(__dirname, './', dir)
}

module.exports = {
  // 根路径
  // publicPath: process.env.NODE_ENV === 'production' ? PROD_BASE_URL : '/CloudLink',
  baseUrl: process.env.NODE_ENV === 'production' ? PROD_BASE_URL : '/',
  // 静态资源文件夹
  assetsDir: 'static',
  productionSourceMap: false,

  configureWebpack: config => {
    config.resolve.alias = Object.assign(config.resolve.alias, {
      '@vant': resolvePath('pre-task/vant/dist'),
      '@res': resolvePath('public/res'),
      '@data': resolvePath('public/data')
    })
    // 忽略打包moment国际化词条文件
    // config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
    config.plugins.push(
      new webpack.ContextReplacementPlugin(
        /moment[\\\/]locale$/,
        /^\.\/(zh-cn)$/
      )
    )
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...
      // config.plugins.push(
      //     new UglifyJsPlugin({
      //         uglifyOptions: {
      //             warnings: false,
      //             compress: {
      //                 drop_debugger: true, // console
      //                 drop_console: true,
      //                 pure_funcs: ['console.log'] // 移除console
      //             }
      //         },
      //         sourceMap: false,
      //         parallel: true
      //     })
      // )
    } else {
      // 为开发环境修改配置...
    }
  },
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    // 开启 CSS source maps?
    sourceMap: false,
    // 启用 CSS modules for all css / pre-processor files.
    modules: false
  },
  // 本地服务器
  devServer: {

    host: '0.0.0.0', // IP
    port: 8930, // 端口号
    // 代理 完整配置参考：https://github.com/chimurai/http-proxy-middleware#proxycontext-config
    proxy: {
      '/api': {
        target: 'http://localhost:5001/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/njdf_websocket': {
        target: 'http://172.16.4.155:82/ucc_server/njdf_websocket',
        changeOrigin: true,
        ws: true,
        secure: false,
        pathRewrite: {
          '^/njdf_websocket': ''
        }
      },
      '/wechatApi': {
        target: 'http://localhost:3005/wechat',
        changeOrigin: true,
        pathRewrite: {
          '^/wechatApi': ''
        }
      },
      '/welink': {
        target: 'https://open.welink.huaweicloud.com/api/auth/v1',
        changeOrigin: true,
        pathRewrite: {
          '^/welink': ''
        }
      },
      '/ucc_server': {
        target: 'http://10.20.2.19:8089/ucc_server',
        changeOrigin: true,
        pathRewrite: {
          '^/ucc_server': ''
        }
      },
      '/njdf_export': {
        target: '172.16.4.76:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/njdf_export': ''
        }
      },
      '/agentgateway': {
        target: 'http://172.16.3.73:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/agentgateway': ''
        }
      },
      '/fileServer': {
        target: 'http://10.20.2.19:8089',
        changeOrigin: true,
        pathRewrite: {
          '^/fileServer': ''
        }
      },
      '/webChat': {
        target: 'http://172.16.4.80:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/webChat': ''
        }
      },
      '/imr': {
        target: 'http://172.16.4.80:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/imr': ''
        }
      },
      '/MailService': {
        target: 'http://172.16.4.80:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/MailService': ''
        }
      }
    }
  },
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type =>
      addStyleResource(config.module.rule('stylus').oneOf(type))
    )

    // // loader-images
    // const ruleImages = config.module.rule('images')
    // // loader-svg
    // const rulesvg = config.module.rule('svg')
    // // loader-media
    // const rulemedia = config.module.rule('media')
    // // loader-fonts
    // const rulefonts = config.module.rule('fonts')

    if (process.env.NODE_ENV === 'production') {
      // 清除默认规则
      // ruleImages.uses.clear()
      // rulesvg.uses.clear()
      // rulemedia.uses.clear()
      // rulefonts.uses.clear()
      // // 附件引入
      // config.module
      //   .rule('res')
      //   .test(/\.(svg|png|jpe?g|gif|webp)(\?.*)?$/)
      //   .exclude
      //   .add(resolvePath('src/assets'))
      //   .end()
      //   .use('file-loader')
      //   .loader('file-loader')
      //   .options({
      //     name: '[name].[ext]',
      //     publicPath: PROD_BASE_URL + 'res'
      //   })
      // ruleImages
      //   .exclude
      //   .add(resolvePath('public/res'))
      //   .end()
      //   .use('file-loader')
      //   .loader('file-loader')
      //   .options({
      //     name: '[name].[hash:8].[ext]',
      //     publicPath: '../images',
      //     outputPath: 'static/images'
      //   })
      // rulesvg
      //   .use('file-loader')
      //   .loader('file-loader')
      //   .options({
      //     name: '[name].[hash:8].[ext]',
      //     publicPath: '../images',
      //     outputPath: 'static/images'
      //   })
      // rulemedia
      //   .use('file-loader')
      //   .loader('file-loader')
      //   .options({
      //     name: '[name].[hash:8].[ext]',
      //     publicPath: '../media',
      //     outputPath: 'static/media'
      //   })
      // rulefonts
      //   .use('file-loader')
      //   .loader('file-loader')
      //   .options({
      //     name: '[name].[hash:8].[ext]',
      //     publicPath: '../fonts',
      //     outputPath: 'static/fonts'
      //   })
    } else {}
  }
}

function addStyleResource (rule) {
  rule
    .use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [path.resolve(__dirname, './src/assets/css/imports.styl')]
    })
}
