/**
 * js相关任务
 * @type {[type]}
 */
'use strict'

var PROJECT_CONFIG = require('../yworkflow').getConfig(); //载入项目基础配置
if (!PROJECT_CONFIG.tasks.js) {
    return;
}
var PROJECT_ABS_PATH = PROJECT_CONFIG.absPath;
var TASK_CONFIG = PROJECT_CONFIG.tasks.js;

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var path = require('path');
var chalk = require('chalk');

var lbfTransport = require('./plugins/gulp-lbf-transport/');
var src = path.join(PROJECT_ABS_PATH, TASK_CONFIG.src);
var dest = path.join(PROJECT_ABS_PATH, TASK_CONFIG.dest);
var sourceMapDes = path.join(PROJECT_ABS_PATH, TASK_CONFIG.sourcemap);
var babel = require('gulp-babel');

console.log("js dest dir:", dest);
// JS代码检查
gulp.task('js:eslint', function() {
    return gulp.src(path.join(src, '**/*.js'))
        .pipe(plugins.changed(dest))
        .pipe(plugins.plumber())
        .pipe(gulp.dest(dest))
        .pipe(plugins.eslint(TASK_CONFIG.eslint))
        .pipe(plugins.eslint.format()); // TASK_CONFIG.eslintFormatter
});

// JS模块转换
gulp.task('js:transport', function() {
    return gulp.src(path.join(dest, '**/*.js'))
        .pipe(plugins.plumber())
        .pipe(plugins.changed(dest))
        .pipe(gulp.dest(dest))
        .pipe(lbfTransport(TASK_CONFIG.lbfTransport))
        .pipe(gulp.dest(dest));
});

// 将JS路径下其他文件全部拷贝到输出目录
gulp.task('js:copy', function () {
    return gulp.src([src + '/**/*.*', '!' + src + '/**/*.js'])
        .pipe(plugins.changed(dest))
        .pipe(gulp.dest(dest));
});

// JS代码检查
gulp.task('js:eslint:build', function() {
    return gulp.src(path.join(src, '**/*.js'))
        .pipe(plugins.plumber())
        .pipe(gulp.dest(dest))
        .pipe(plugins.eslint(TASK_CONFIG.eslint))
        .pipe(plugins.eslint.format()); // TASK_CONFIG.eslintFormatter
});

// JS模块转换
gulp.task('js:transport:build', function() {
    return gulp.src(path.join(dest, '**/*.js'))
        .pipe(plugins.plumber())
        .pipe(gulp.dest(dest))
        .pipe(lbfTransport(TASK_CONFIG.lbfTransport))
        .pipe(gulp.dest(dest));
});

// 将JS路径下其他文件全部拷贝到输出目录
gulp.task('js:copy:build', function () {
    return gulp.src([src + '/**/*.*', '!' + src + '/**/*.js'])
        .pipe(gulp.dest(dest));
});


gulp.task('js', function (done) {
        gulp.watch(path.join(src, '**/*.js'), ['js:eslint', 'js:babel', 'js:transport', 'js:copy'])
        .on('change',function(event){
            console.log(chalk.green('[文件变化:JS]' + event.path));
        })
    runSequence('js:eslint', 'js:babel', 'js:transport', 'js:copy', done);
});

gulp.task('js:build', function (done) {
    runSequence('js:eslint:build', 'js:babel', 'js:transport:build', 'js:copy:build', done);
});

// 添加babel任务
gulp.task('js:babel', () =>
    gulp.src(path.join(src, '**/*.js'))
        .pipe(plugins.plumber())
        .pipe(babel({
            presets: [['@babel/preset-env', {
                "modules": false // 避免开启strict mode导致业务代码中this为undefined，当前项目也不会用到es6 module
            }]]
        }))
        .pipe(gulp.dest(dest))
);
