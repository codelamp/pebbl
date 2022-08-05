var gulp = require('gulp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');

gulp.task('prod-js-core', function(){
  return gulp.src([
      'src/theory.is.js',
      'src/theory.has.js',
      'src/theory.to.js',
      'src/theory.run.js',
      'src/theory.base.js',
      'src/theory._.js',
    ])
    .pipe(concat('theory.js'))
    .pipe(minify())
    .pipe(gulp.dest('build'))
  ;
});

gulp.task('prod-js-plugins', function(){
  return gulp.src(['src/plugins/*.js'])
    .pipe(minify({
      noSource: true,
      ext: {
        min: '.min.js'
      }
    }))
    .pipe(gulp.dest('build/plugins'))
  ;
});

gulp.task('prod-js', ['prod-js-core', 'prod-js-plugins']);
gulp.task('default', [ 'prod-js' ]);