// const path = require('path')

// function pathResolve (dir) {
//   return path.join(__dirname, './', dir)
// }

module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    // [
    //   'import',
    //   {
    //     libraryName: 'vant',
    //     libraryDirectory: 'es',
    //     style: true
    //   }
    // ]
    // [
    //   'import',
    //   {
    //     libraryName: '@vant',
    //     libraryDirectory: 'dist',
    //     style: true,
    //     customName: name => {
    //       console.log(`vant`, name)
    //       return pathResolve(`pre-task/vant/dist/${name}`)
    //     }
    //   }
    // ]
  ]
}
