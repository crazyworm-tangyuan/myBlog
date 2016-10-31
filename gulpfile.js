var gulp = require('gulp');
var less = require('gulp-less');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var del = require('del');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var size = require('gulp-size');
var notify = require('gulp-notify');

gulp.task('serve', ['html', 'css', 'js', 'img', 'font'], function() {
    browserSync.init({
        server: {
          baseDir: './dist'
        }
    });
});

gulp.task('watch', function() {
  gulp.watch('./src/*.html', ['html', browserSync.reload]);
  gulp.watch('./src/styles/**/*.less', ['css', browserSync.reload]);
  gulp.watch('./src/scripts/**/*.js', ['js', browserSync.reload]);
  gulp.watch('./src/images/**/*', ['img', browserSync.reload]);
  gulp.watch('./src/font/*', ['font', browserSync.reload]);
});

// 通用任务
gulp.task('clean', function() {
	  del.sync(['./dist/**', './build/**']);
});

gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(size())
        .pipe(gulp.dest('./dist'));
});

gulp.task('css', function () {
  	return gulp.src('./src/styles/**/*.less')
    		.pipe(sourcemaps.init()) 
      	.pipe(less({
      		plugins: [autoprefix]
    		}))
    		.on('error',  notify.onError({
          	message: "出错啦~~~~(>_<)~~~~: <%= error.message %>",
          	title: "Less文件出错"
        }))
    		.pipe(sourcemaps.write())
    		.pipe(size())
      	.pipe(gulp.dest('./dist/css'));
});

// 开发任务

gulp.task('js', function () {
    return gulp.src('./src/scripts/**/*.js')
        .pipe(size())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('img', function() {
    return gulp.src('src/images/*')
        .pipe(size())
        .pipe(gulp.dest('./dist/images'));
});

gulp.task('font', function(){
    return gulp.src(['./src/font/*'])
        .pipe(size())
        .pipe(gulp.dest('./dist/font/'));
});

// 发布任务
gulp.task('build:img', function() {
    gulp.src('./src/images/*')
        .pipe(imagemin())
        .pipe(size())
        .pipe(gulp.dest('./bulid/images'))
});

gulp.task('build', ['clean', 'html', 'css', 'js', 'font', 'build:img'], function() {
    return gulp.src('./src/*.html')
        .pipe(useref({ searchPath: './dist' }))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(size())
        .pipe(gulp.dest('./build'));
});

gulp.task('default', ['clean', 'watch', 'serve']);