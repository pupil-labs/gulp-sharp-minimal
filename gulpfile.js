var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulp_sharp = require('./');


gulp.task('image_minify', function(){
  options = {
    resize: 0.5,
    quality: 20,
    progressive: true,
    compressionLevel: 9,
    sequentialRead: true
    // trellisQuantisation: true
  }
  return gulp.src('../build/media/images/about/*.{jpg,png}')
    .pipe(plumber())
    .pipe(gulp_sharp(options))
    .pipe(gulp.dest('./dist'));
})





gulp.task('default',['image_minify']);