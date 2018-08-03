var gulp = require('gulp');
var concatCss = require('gulp-concat-css');
var uglifyjs = require('uglify-js');
var composer = require('gulp-uglify/composer');
var minify = composer(uglifyjs, console);
var pump = require('pump');
const babel = require('gulp-babel');
var uglifycss = require('gulp-uglifycss');

gulp.task('css', function () {
  return gulp.src([
    './css/index.css',
    './css/restaurant.css'
  ])
    .pipe(uglifycss({
        "maxLineLen": 80,
        "uglyComments": true
    }))
    .pipe(gulp.dest('./css/uglified'));
});


gulp.task('js', (cb) => {
    pump([
        gulp.src('js/dbhelper.js'),
        babel({
            presets: ['env']
        }),
        minify({}),
        gulp.dest('js/uglified')
    ], cb);
});

gulp.task('default', ['css', 'js'], () => {
    console.log('Gulp Done...');
});

