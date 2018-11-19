'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var file = require('gulp-file');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var merge = require('merge2');
var path = require('path');
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var pkg = require('./package.json');

var srcDir = './src/';
var outDir = './dist/';
var samplesDir = './samples/';

/**
 * Generates the bower.json manifest file which will be pushed along release tags.
 * Specs: https://github.com/bower/spec/blob/master/json.md
 */
gulp.task('bower', function() {
	var json = JSON.stringify({
		name: pkg.name,
		description: pkg.description,
		homepage: pkg.homepage,
		license: pkg.license,
		version: pkg.version,
		main: outDir + pkg.name + '.js',
		ignore: [
			'.codeclimate.yml',
			'.gitignore',
			'.npmignore',
			'.travis.yml',
			'scripts'
		]
	}, null, 2);

	return file('bower.json', json, {src: true})
		.pipe(gulp.dest('./'));
});

gulp.task('build', function() {
	return rollup('rollup.config.js')
		.pipe(source(pkg.name + '.js'))
		.pipe(gulp.dest(outDir))
		.pipe(rename(pkg.name + '.min.js'))
		.pipe(streamify(uglify({output: {comments: 'some'}})))
		.pipe(gulp.dest(outDir));
});

gulp.task('package', function() {
	return merge(
		// gather "regular" files landing in the package root
		gulp.src([path.join(outDir, '*.js'), 'LICENSE.md']),

		// since we moved the dist files one folder up (package root), we need to rewrite
		// samples src="../dist/ to src="../ and then copy them in the /samples directory.
		gulp.src(path.join(samplesDir, '**/*'), {base: '.'})
			.pipe(streamify(replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1')))
	)
		// finally, create the zip archive
		.pipe(zip(pkg.name + '.zip'))
		.pipe(gulp.dest(outDir));
});

gulp.task('watch', function() {
	return gulp.watch('./src/**', gulp.parallel('build'));
});

gulp.task('lint', function() {
	var files = [
		srcDir + '**/*.js',
		'*.js'
	];

	var options = {
		rules: {
			complexity: [1, 10],
			'max-statements': [1, 30]
		}
	};

	return gulp.src(files)
		.pipe(eslint(options))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('default', gulp.parallel('build'));
