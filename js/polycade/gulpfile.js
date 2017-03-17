var gulp = require('gulp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');

gulp.task('prod-js', function(){
  return gulp.src(['src/polycade._.js'])
    .pipe(concat('polycade.js'))
    .pipe(minify())
    .pipe(gulp.dest('build'))
  ;
});

gulp.task('default', [ 'prod-js' ]);