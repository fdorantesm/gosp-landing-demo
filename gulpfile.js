'use strict'

const autoprefixer = require('gulp-autoprefixer')
const browserSync = require('browser-sync').create()
const gm = require('gulp-gm')
const gulp = require('gulp')
const jsmin = require('gulp-jsmin')
const removeEmptyLines = require('gulp-remove-empty-lines')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const watch = require('gulp-watch')
const babel = require('gulp-babel')
const svgo = require('gulp-svgo')
const pug = require('gulp-pug')
const concat = require('gulp-concat')

const vendors = { browsers: ['last 5 versions'] }
const gosp = require('gosp.css').includePaths + '/src'
const normalize = require('node-normalize-scss').includePaths

const error = (e) => {
	console.log(e.toString())
}

gulp.task('sync', () => {
    browserSync.init({
    	server: {
    		baseDir: "./",
    		index: "index.html"
    	}
    })
})

gulp.task('css', () => {
		gulp.src('./dev/scss/**/*.scss')
			.pipe(sourcemaps.init())
			.pipe(sass({
				outputStyle: 'compressed',
				includePaths: [normalize, gosp]
			}).on('error', sass.logError))
			.pipe(autoprefixer(vendors))
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(sourcemaps.write('.'))
			.pipe(removeEmptyLines())
			.pipe(gulp.dest('./static/css/'))
			.pipe(browserSync.stream())

		gulp.src('./dev/scss/**/*.scss')
			.pipe(sourcemaps.init())
			.pipe(sass({
				outputStyle: 'expanded',
				includePaths: [normalize, gosp]
			}).on('error', sass.logError))
			.pipe(autoprefixer(vendors))
			.pipe(sourcemaps.write('.'))
			.pipe(removeEmptyLines())
			.pipe(gulp.dest('./static/css/'))
			.pipe(browserSync.stream())
})

gulp.task('fonts', () => {
		gulp.src('./dev/fonts/**/*')
			.pipe(gulp.dest('./static/fonts'))
			.on('error', sass.logError)
			.pipe(browserSync.stream())

		gulp.src('./dev/fonts/*.css')
			.pipe(sass({outputStyle: 'compressed'}))
			.on('error', sass.logError)
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(gulp.dest('./static/fonts'))
			.pipe(browserSync.stream())
})

gulp.task('js', () => {
		gulp.src([ './dev/js/**/*.js', '!./dev/js/libs/*.js' ])
			.pipe(sourcemaps.init())
			.pipe(babel({presets: ['env']}))
			.on('error', error)
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(jsmin())
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest('./static/js/'))
			.pipe(browserSync.stream())

		gulp.src([ './dev/js/**/*.js', '!./dev/js/libs/*.js' ])
			.pipe(sourcemaps.init())
			.pipe(babel({presets: ['env']}))
			.on('error', error)
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest('./static/js/'))
			.pipe(browserSync.stream())

		gulp.src('./dev/js/libs/**/*.js')
			.pipe(sourcemaps.init())
			.pipe(concat('plugins.js'))
			.on('error', error)
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest('./static/js/'))

})

gulp.task('svg', () => {
		gulp.src('./dev/img/**/*.svg')
			.pipe(svgo())
			.on('error', error)
			.pipe(gulp.dest('./static/img/'))
			.pipe(browserSync.stream())
})

gulp.task('img', () => {
		gulp.src('./dev/img/**/*.{png,gif,jpg,jpeg}')
			.pipe(gm(
				(gmfile) => {
					return gmfile
						.quality(85)
						.samplingFactor(4, 2)
						.colorspace('sRGB')
						.interlace('none')
						.strip();
				}, { imageMagick: true }
			))
			.on('error', error)
			.pipe(gulp.dest('./static/img/'))
})

gulp.task('pug', () => {
		gulp.src('./dev/pug/*.pug')
			.pipe(pug({pretty: false}))
			.on('error', error)
			.pipe(removeEmptyLines())
			.pipe(gulp.dest('./'))
			browserSync.reload()
})

gulp.task('default', ['sync'], () => {
	watch('./dev/scss/**/*.scss', () => {
		gulp.start('css')
		browserSync.stream()
	})

	watch('./dev/js/**/*.js', () => {
		gulp.start('js')
		browserSync.reload()
	})

	watch('./app/views/**/*.pug', () => {
		browserSync.reload()
	})

	watch('./dev/img/**/*.{png,gif,jpg,jpeg}', () => {
		gulp.start('img')
	})

	watch('./dev/img/**/*.svg', () => {
		gulp.start('svg')
	})

	watch('./dev/fonts/**/*', () => {
		gulp.start('fonts')
	})

	watch('./dev/pug/**/*', () => {
		gulp.start('pug')
	})
})
