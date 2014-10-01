'use strict';

/********************************
*********************************
			VARS
*********************************
*********************************/

var gulp = require('gulp'),
	header = require('gulp-header'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	processhtml = require('gulp-processhtml'),
	path = require('path'),
	autoprefixer = require('gulp-autoprefixer'),
	concatCss = require("gulp-concat-css"),
	minifyCss = require("gulp-minify-css"),
	less = require('gulp-less'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require("gulp-rename"),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber'),
	gulpif = require('gulp-if'),

	imagemin = require('gulp-imagemin'),
	pngcrush = require('imagemin-pngcrush'),

	connect = require('gulp-connect'),

	pkg = require('./package.json'),

	banner = ['/**',
	' * <%= pkg.author %>',
	' * <%= pkg.name %> v<%= pkg.version %>',
	' */',
	''].join('\n');

var config = {
	image: {
		minimize: true // https://github.com/sindresorhus/gulp-imagemin
	},
	css: {
		minify: false 	// TODO: DO NOT WORK WITH MIXIN
						//.inlineblock (display: inline-block removed after minification).
						// NEED SOME FIX!
	},
	server: {
		copy: true, // Copy to local server
		path: 'c:/WebServers/home/localhost/basik'
	}
};


/********************************
*********************************
			TASKS
*********************************
*********************************/

gulp.task('connectToDevServer', connectToDevServer);

gulp.task('default', ['build', 'watch']);

gulp.task('release', ['prepareProject', 'build']);
gulp.task('build', ['processStyles', 'processScripts', 'processHtml']);

gulp.task('processHtml', processHtml);

gulp.task('processScripts', processJs);
gulp.task('processStyles', ['buildLess', 'processCss']); // async: first, build LESS files then process css
gulp.task('buildLess', buildLess);
gulp.task('processCss', ['buildLess'], processCss);

gulp.task('prepareProject', ['processImages', 'copyFonts', 'copyVendorsJs', 'copyVendorsCss', 'copyFavicon']);
gulp.task('processImages', processImages);
gulp.task('copyFonts', copyFonts);
gulp.task('copyVendorsJs', copyVendorsJs);
gulp.task('copyVendorsCss', copyVendorsCss);

gulp.task('copyFavicon', copyFavicon);

gulp.task('watch', watch);
gulp.task('watchHtml', watchHtml);
gulp.task('watchImages', watchImages);
gulp.task('watchFonts', watchFonts);
gulp.task('watchCss', watchCss);
gulp.task('watchLess', watchLess);
gulp.task('watchJs', watchJs);
gulp.task('watchFavicon', watchFavicon);
gulp.task('watchVendorJs', watchVendorJs);
gulp.task('watchVendorCss', watchVendorCss);

/********************************
*********************************
			FUNCTIONS
*********************************
*********************************/

/* Helpers */

function getNotifySettings(message) {
	var date = new Date(),
		time = date.toTimeString().split(' ')[0];
	return {
		message: message +  " @ <%= options.time %>",
		onLast: true,
		templateOptions: {
			time: time
		}
	}
}

function getNotifyDetailedSettings(message) {
	var date = new Date(),
		time = date.toTimeString().split(' ')[0];
	return {
		message: message +  ": <%= file.relative %> @ <%= options.time %>",
		templateOptions: {
			time: time
		}
	}
}

/* Process something */

function processHtml() {
	gulp.src('src/index.html')
		.pipe(plumber())
		.pipe(processhtml('index.html'))
		.pipe(gulp.dest('./'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path)))
		.pipe(notify(getNotifySettings('Processed html')))
		.pipe(connect.reload());

}

function buildLess() {
	return gulp.src('src/assets/css/main.less')
		.pipe(less())
		.pipe(gulp.dest('src/assets/css'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/src/assets/css')))
		.pipe(notify(getNotifyDetailedSettings('Builded LESS')))
		.pipe(connect.reload());
}

function processCss() {
	gulp.src([
			'src/assets/css/vendors/normalize.css',
			'src/assets/css/vendors/bootstrap.css',
			'src/assets/css/vendors/bootstrap-theme.css',
			'src/assets/css/main.css'
		]).pipe(plumber())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(concatCss("bundle.css"))
		.pipe(gulpif(config.css.minify, minifyCss()))
		.pipe(rename('bundle.min.css'))
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest('assets/css'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/assets/css')))
		.pipe(notify(getNotifyDetailedSettings('Processed css')))
		.pipe(connect.reload());
}

function processJs() {

	gulp.src([
			'src/assets/js/plugins/jquery.mousewheel.js',
			'src/assets/js/namespace.js',
			'src/assets/js/plugins/jstools.js',
			'src/assets/js/plugin/slider.js',
			'src/assets/js/app.js',
			'src/assets/js/main.js'
		]).pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));

	
	gulp.src([
			'src/vendors/jquery/js/jquery-1.11.1.min.js',
			'src/vendors/bootstrap/js/bootstrap.min.js',
			'src/assets/js/plugins/jquery.mousewheel.js',
			'src/assets/js/namespace.js',
			'src/assets/js/plugins/jstools.js',
			'src/assets/js/plugin/slider.js',
			'src/assets/js/app.js',
			'src/assets/js/main.js'
		]).pipe(plumber())
		.pipe(uglify())
		.pipe(concat('app.min.js'))
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest('assets/js'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/assets/js')))
		.pipe(notify(getNotifyDetailedSettings('Processed js')))
		.pipe(connect.reload());
}

function processImages() {
	gulp.src('src/assets/img/**/*.*')
		.pipe(plumber())
		.pipe(gulp.dest('assets/img'))
		.pipe(gulpif(config.image.minimize, imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngcrush()]
		})))
		.pipe(gulpif(config.image.minimize, gulp.dest('assets/img')))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/assets/img')))
		.pipe(notify(getNotifyDetailedSettings('Processed Images')))
		.pipe(connect.reload());
}

/* Copy only tasks */

function copyFonts() {
	gulp.src('src/assets/css/fonts/**/*.*')
		.pipe(plumber())
		.pipe(gulp.dest('assets/css/fonts'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/assets/css/fonts')))
		.pipe(notify(getNotifySettings('Copied Fonts')))
		.pipe(connect.reload());
}

function copyVendorsJs() {

	gulp.src(['node_modules/jquery-mousewheel/jquery.mousewheel.js'])
		.pipe(gulp.dest('src/assets/js/plugins/'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/src/assets/js/plugins/')))
		.pipe(notify(getNotifyDetailedSettings('Copied plugins js')));

	gulp.src(['bower_components/jquery/dist/jquery.js'])
		.pipe(gulp.dest('src/assets/js/vendors/'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/assets/js/vendors/')))
		.pipe(notify(getNotifySettings('Copied vendors js')))
		.pipe(connect.reload());
}

function copyVendorsCss() {

	gulp.src([
		'node_modules/normalize.less/node_modules/normalize.css/normalize.css',
		'node_modules/bootstrap/dist/css/bootstrap.css',
		'node_modules/bootstrap/dist/css/bootstrap-theme.css'
		])
		.pipe(gulp.dest('src/assets/css/vendors/'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + 'src/assets/css/vendors/')))
		.pipe(notify(getNotifyDetailedSettings('Copied vendors css')));

	gulp.src(['src/assets/js/vendor/*.js'])
		.pipe(gulp.dest('js/vendor'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/assets/js/vendor')))
		.pipe(notify(getNotifySettings('Copied vendor js')))
		.pipe(connect.reload());
}

function copyFavicon() {
	gulp.src(['src/assets/favicon.ico'])
		.pipe(gulp.dest('./'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path)))
		.pipe(notify(getNotifySettings('Copied favicon')))
		.pipe(connect.reload());
}

/* Watch tasks */

function watchHtml() {
	gulp.watch('src/assets/*.html', ['processHtml']);
}

function watchImages() {
	gulp.watch('src/assets/img/*', ['processImages']);
}

function watchFonts() {
	gulp.watch('src/assets/css/fonts/**/*.*', ['copyFonts']);
}

function watchLess() {
	gulp.watch(['src/assets/css/*.less', 'src/assets/css/**/*.less', 'src/assets/css/**/**/*.less'], ['buildLess']);
}

function watchCss() {
	gulp.watch('src/assets/css/*.css', ['processCss']);
}

function watchVendorJs() {
	gulp.watch('src/assets/js/vendor/*.js', ['copyVendorsJs']);
}

function watchVendorCss() {
	gulp.watch('src/assets/js/vendor/*.js', ['copyVendorsCss']);
}

function watchFavicon() {
	gulp.watch('src/assets/favicon.ico', ['watchFavicon']);
}

function watchJs() {
	gulp.watch('src/assets/js/*.js', ['processScripts']);
}

function watch() {
	gulp.run(['watchHtml', 'watchImages', 'watchFonts', 'watchCss', 'watchJs', 'watchVendorJs', 'watchVendorCss', 'watchFavicon', 'watchLess']);
}

function notifyChanges(event){
	notify(event.path+' -> '+event.type);
}

function connectToDevServer() {
	connect.server({
		root: './src',
		livereload: true
	});
};