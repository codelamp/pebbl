var gulp = require('gulp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');

gulp.task('prod-js', function(){
  return gulp.src([
      'src/polycade.base.js',
      'src/polycade.entities.base.js',
      'src/polycade.entities.shadow.js',
      'src/polycade.entities.adornment.js',
      'src/polycade.game.js',
      'src/polycade.imagination.body.js',
      'src/polycade._.js',
      'src/managers/polycade.assets.js',
      'src/managers/polycade.events.js',
      'src/managers/polycade.screens.js'
    ])
    .pipe(concat('polycade.js'))
    .pipe(minify())
    .pipe(gulp.dest('build'))
  ;
});

gulp.task('default', [ 'prod-js' ]);