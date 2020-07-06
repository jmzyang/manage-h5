'use strict'

// elementUI styles cli
const path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const less = require('gulp-less')
const autoprefixer = require('gulp-autoprefixer')
const cssmin = require('gulp-cssmin')
// const props2json = require('gulp-props2json')
// const gulpJson = require('gulp-json')

function pathResolve (dir) {
  return path.join(__dirname, './', dir)
}

const piePath = pathResolve('pre-task/vant/dist')

// gulp.task('copyJs', function () {
//   var folders = [pathResolve('pre-task/vant/src/*/*.js'), pathResolve('pre-task/vant/src/mixins/**/*'), pathResolve('pre-task/vant/src/utils/**/*'), pathResolve('pre-task/vant/src/locale/lang/**/*')]
//   var foldersPipe = [piePath, pathResolve('pre-task/vant/dist/mixins'), pathResolve('pre-task/vant/dist/utils'), pathResolve('pre-task/vant/dist/locale/lang')]
//   // 遍历得到每一个子文件
//   var tasks = folders.map((item, index) => {
//     gulp
//       .src(item)
//       .pipe(gulp.dest(foldersPipe[index]))
//   })
//   return tasks
// })

gulp.task('copyCss', function () {
  return gulp
    .src([pathResolve('pre-task/vant/src/*/style/index.js')])
    .pipe(gulp.dest(piePath))
})

gulp.task('compile', function () {
  return gulp
    .src(pathResolve('pre-task/vant/src/**/*.less'))
    .pipe(less())
    .pipe(
      autoprefixer({
        browsers: ['ie > 9', 'last 2 versions'],
        cascade: false
      })
    )
    // .pipe(cssmin())
    .pipe(gulp.dest(piePath))
})

// gulp.task('copyfont', function () {
//   return gulp
//     .src(pathResolve('pre-task/vant/src/fonts/**'))
//     .pipe(cssmin())
//     .pipe(gulp.dest(pathResolve('pre-task/vant/lib/fonts')))
// })

gulp.task('default', ['copyCss', 'compile'], function () {
  gulp.watch(pathResolve('pre-task/vant/src/**/*'), [
    'copyCss',
    'compile'
  ])
})
gulp.task('build', ['compile'])
