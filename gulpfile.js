var gulp = require('gulp');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var file = require('gulp-file');
var insert = require('gulp-insert');
var replace = require('gulp-replace');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var package = require('./package.json');

var srcDir = './src/';
var outDir = './dist/';
var samplesDir = './samples/';

var header = "/*!\n\
 * chartjs-plugin-streaming\n\
 * http://github.com/nagix/chartjs-plugin-streaming/\n\
 * Version: {{ version }}\n\
 *\n\
 * Copyright 2017 Akihiko Kusanagi\n\
 * Released under the MIT license\n\
 * https://github.com/nagix/chartjs-plugin-streaming/blob/master/LICENSE.md\n\
 */\n";

gulp.task('bower', bowerTask);
gulp.task('build', buildTask);
gulp.task('package', packageTask);
gulp.task('watch', watchTask);
gulp.task('lint', lintTask);
gulp.task('default', ['build']);

/**
 * Generates the bower.json manifest file which will be pushed along release tags.
 * Specs: https://github.com/bower/spec/blob/master/json.md
 */
function bowerTask() {
  var json = JSON.stringify({
      name: package.name,
      description: package.description,
      homepage: package.homepage,
      license: package.license,
      version: package.version,
      main: outDir + package.name + '.js',
      ignore: [
        '.codeclimate.yml',
        '.gitignore',
        '.npmignore',
        '.travis.yml',
        'scripts'
      ]
    }, null, 2);

  return file('bower.json', json, { src: true })
    .pipe(gulp.dest('./'));
}

function buildTask() {

  var nonBundled = browserify('./src/plugin.streaming.js')
    .ignore('moment')
    .ignore('chart.js')
    .bundle()
    .pipe(source(package.name + '.js'))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(gulp.dest(outDir))
    .pipe(streamify(uglify()))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(streamify(concat(package.name + '.min.js')))
    .pipe(gulp.dest(outDir));

  return nonBundled;

}

function packageTask() {
  return merge(
      // gather "regular" files landing in the package root
      gulp.src([outDir + '*.js', 'LICENSE.md']),

      // since we moved the dist files one folder up (package root), we need to rewrite
      // samples src="../dist/ to src="../ and then copy them in the /samples directory.
      gulp.src(samplesDir + '**/*', { base: '.' })
        .pipe(streamify(replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1')))
  )
  // finally, create the zip archive
  .pipe(zip(package.name + '.zip'))
  .pipe(gulp.dest(outDir));
}

function watchTask() {
  return gulp.watch('./src/**', ['build']);
}

function lintTask() {
  var files = [
    srcDir + '**/*.js',
  ];

  return gulp.src(files)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}
