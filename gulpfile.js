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
		minimize: true, // https://github.com/sindresorhus/gulp-imagemin,
		source: 'src/assets/img/**/*.*',
		dest: 'assets/img'
	},
	css: {
		minify: false 	// TODO: DO NOT WORK WITH MIXIN
						//.inlineblock (display: inline-block removed after minification).
						// NEED SOME FIX!
	},
	fonts: {
		source: 'src/assets/css/fonts/**/*.*',
		dest: 'assets/css/fonts'
	},
	// config.js
	js: {
		// config.js.bundles
		bundles: {
			// config.js.bundles.dependency
			dependency: {
				// config.js.bundles.dependency.files
				files: {
					jquery: 		'bower_components/jquery/dist/jquery.js',
					underscore: 	'bower_components/underscore/underscore.js',
					handlebars: 	'bower_components/handlebars/handlebars.js',
					slimscroll: 	'bower_components/fullpage.js/vendors/jquery.slimscroll.min.js',
					easings: 		'bower_components/fullpage.js/vendors/jquery.easings.min.js',
					fullPage: 		'bower_components/fullpage.js/jquery.fullPage.js',
					mousewheel: 	'node_modules/jquery-mousewheel/jquery.mousewheel.js'				
				},
				// config.js.bundles.dependency.dest
				dest: 'src/assets/js',
				// config.js.bundles.dependency.bundleName
				bundleName: 'dependency.min.js'
			},
			// config.js.bundles.development
			development: {
				// config.js.bundles.development.filesArr
				filesArr: [
					'src/assets/js/namespace.js',
					'src/assets/js/jstools.js',
					'src/assets/js/scroller.js',
					'src/assets/js/eventlist.js',
					'src/assets/js/state.js',
					'src/assets/js/order.js',
					'src/assets/js/controls/popup.goodsitem.js',
					'src/assets/js/controls/popup.request-callback.js',
					'src/assets/js/controls/button.js',
					'src/assets/js/goods-catalog.js',
					'src/assets/js/app.js',
					'src/assets/js/main.js'
				],
				// config.js.bundles.development.dest
				dest: 'assets/js',
				// config.js.bundles.development.bundleName
				bundleName: 'app.min.js'
			}		
		}
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

gulp.task('prepareProject', ['processImages', 'copyFonts', 'copyJsDependency', 'copyCssDependency', 'copyFavicon']);
gulp.task('processImages', processImages);
gulp.task('copyFonts', copyFonts);
gulp.task('copyJsDependency', copyJsDependency);
gulp.task('copyCssDependency', copyCssDependency);

gulp.task('copyFavicon', copyFavicon);

gulp.task('watch', watch);
gulp.task('watchHtml', watchHtml);
gulp.task('watchImages', watchImages);
gulp.task('watchFonts', watchFonts);
gulp.task('watchCss', watchCss);
gulp.task('watchLess', watchLess);
gulp.task('watchJs', watchJs);
gulp.task('watchFavicon', watchFavicon);
gulp.task('watchJsDependency', watchJsDependency);
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
			'src/assets/css/vendors/jquery.fullPage.css',
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

	// jshint for development files

	var bundles = config.js.bundles;

	gulp.src(bundles.development.filesArr).pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));

	// concat dependency and development javascript files into one bundle than
	// copy it to the destination folder and to the local server if needed.

	gulp.src([ bundles.dependency.dest + '/' + bundles.dependency.bundleName ].concat(bundles.development.filesArr))
		.pipe(plumber())
		.pipe(uglify())
		.pipe(concat(bundles.development.bundleName))
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest(bundles.development.dest))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/' + bundles.development.dest)))
		.pipe(notify(getNotifyDetailedSettings('Processed js')))
		.pipe(connect.reload());

}

function processImages() {

	gulp.src(config.image.source)
		.pipe(plumber())
		.pipe(gulp.dest(config.image.dest))
		.pipe(gulpif(config.image.minimize, imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngcrush()]
		})))
		.pipe(gulpif(config.image.minimize, gulp.dest(config.image.dest)))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/' + config.image.dest)))
		.pipe(notify(getNotifyDetailedSettings('Processed Images')))
		.pipe(connect.reload());
}

/* Copy only tasks */

function copyFonts() {

	gulp.src(config.fonts.source)
		.pipe(plumber())
		.pipe(gulp.dest(config.fonts.dest))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/' + config.fonts.dest)))
		.pipe(notify(getNotifySettings('Copied Fonts')))
		.pipe(connect.reload());
}

function copyJsDependency() {

	var dependency = config.js.bundles.dependency;

	gulp.src([
				dependency.files.jquery,
				dependency.files.underscore,
				dependency.files.handlebars/*,
				dependency.files.mousewheel,
				dependency.files.easings,
				dependency.files.slimscroll,
				dependency.files.fullPage*/
			])
		.pipe(uglify())
		.pipe(concat(dependency.bundleName))
		.pipe(gulp.dest(dependency.dest))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/' + dependency.dest)))
		.pipe(notify(getNotifyDetailedSettings('Copied javascript dependencies')));

}

function copyCssDependency() {

	gulp.src(['src/assets/css/style-ie7.css'])
		.pipe(gulp.dest('assets/css/'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + '/assets/css/')))
		.pipe(notify(getNotifySettings('Copied style-ie7.css')));

	gulp.src([
		'node_modules/normalize.less/node_modules/normalize.css/normalize.css',
		'node_modules/bootstrap/dist/css/bootstrap.css',
		'node_modules/bootstrap/dist/css/bootstrap-theme.css',
		'node_modules/bootstrap/dist/css/bootstrap.css.map',
		'node_modules/bootstrap/dist/css/bootstrap-theme.css.map'/*,
		'bower_components/fullpage.js/jquery.fullPage.css'*/
		])
		.pipe(gulp.dest('src/assets/css/vendors/'))
		.pipe(gulpif(config.server.copy, gulp.dest(config.server.path + 'src/assets/css/vendors/')))
		.pipe(notify(getNotifyDetailedSettings('Copied vendors css')))
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

function watchJsDependency() {

	var dependency = config.js.bundles.dependency;
	gulp.watch([
				dependency.files.jquery,
				dependency.files.underscore,
				dependency.files.handlebars/*,
				dependency.files.easings,
				dependency.files.slimscroll,
				dependency.files.fullPage,
				dependency.files.mousewheel*/
	], ['copyJsDependency']);
}

function watchVendorCss() {
	gulp.watch('src/assets/js/vendor/*.js', ['copyCssDependency']);
}

function watchFavicon() {
	gulp.watch('src/assets/favicon.ico', ['watchFavicon']);
}

function watchJs() {
	gulp.watch('src/assets/js/*.js', ['processScripts']);
}

function watch() {
	gulp.run(['watchHtml', 'watchImages', 'watchFonts', 'watchCss', 'watchJs', 'watchJsDependency', 'watchVendorCss', 'watchFavicon', 'watchLess']);
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