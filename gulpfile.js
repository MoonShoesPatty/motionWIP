const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

gulp.task('styles', () => {
	return gulp.src('./dev/styles/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(concat('style.css'))
		.pipe(gulp.dest('./public/styles/'))
		.pipe(reload({ stream: true }));
});

gulp.task('scripts', () => {
    gulp.src('./dev/scripts/script.js')
        .pipe(babel())
		.pipe(gulp.dest('./public/scripts'))
		.pipe(reload({ stream: true }));
});

gulp.task('watch', function () {
	gulp.watch('./dev/styles/**/*.scss', ['styles']);
	gulp.watch('./dev/scripts/script.js', ['scripts']);
	gulp.watch('*.html', reload);
});

gulp.task('browser-sync', () => {
	browserSync.init({
		server: '.'
	})
});

gulp.task('default', ['browser-sync', 'styles', 'scripts', 'watch']);