var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulp_sharp = require('../index.js');
var gutil = require('gulp-util');
var size = require('gulp-size');


gulp.task('image_minify', function(cb){
  options = {
    resize: [500,800],
    quality: 20,
    progressive: true,
    compressionLevel: 9,
    sequentialRead: true,
    trellisQuantisation: false
  }
  return gulp.src('../test/fixtures/*.jpg')
    .pipe(size())
    .pipe(plumber())
    .pipe(gulp_sharp(options))
    .pipe(size())
    .pipe(gulp.dest('./dist'));
})





gulp.task('default',['image_minify']);