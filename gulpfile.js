const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sync = require('browser-sync').create();
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');

// Styles

const styles = () => {
  return gulp
    .src('source/css/styles.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))

    .pipe(csso())
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(sync.stream());
};

exports.styles = styles;

//HTML

const html = () => {
  return gulp
    .src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true, conservativeCollapse: true }))
    .pipe(gulp.dest('build'));
};

exports.html = html;

// Images

const images = () => {
  return gulp
    .src('source/img/**/*.{jpg,png}')
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.mozjpeg({ quality: 85, progressive: true }),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest('source/img'));
};

exports.images = images;

//JS

/* const js = () => {
  return gulp
    .src('source/js/scripts.js')
    .pipe(uglify())
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest('build/js'));
};

exports.js = js; */

// WebP Generation

const generateWebp = () => {
  return gulp
    .src('source/img/**/*.{jpg,png}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('source/img'));
};

exports.generateWebp = generateWebp;

// Copy

const copy = () => {
  return gulp
    .src(['source/fonts/*.{woff,woff2,ttf}', 'source/img/**', 'source/js/**', 'source/*.ico'], {
      base: 'source'
    })
    .pipe(gulp.dest('build'));
};

exports.copy = copy;

// Clean

const clean = () => {
  return del('build');
};

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false
  });
  done();
};

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch('source/css/**/*.scss', gulp.series('styles'));
  gulp.watch('source/*.html').on('change', gulp.series(html, sync.reload));
  /* gulp.watch('source/js/*.js').on('change', gulp.series(js, sync.reload)); */
};

exports.default = gulp.series(styles, server, watcher);

// Build

const build = gulp.series(clean, generateWebp, images, copy, styles, html);

exports.build = build;

// Start

const start = gulp.series(build, server, watcher);

exports.start = start;
