var gulp = require('gulp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');

gulp.task('prod-js', function(){
  return gulp.src(['src/theory.is.js', 'src/theory.has.js', 'src/theory.to.js', 'src/*.js', '!src/theory._.js'])
    .pipe(concat('theory.js'))
    .pipe(minify())
    .pipe(gulp.dest('build'))
  ;
});

gulp.task('default', [ 'prod-js' ]);