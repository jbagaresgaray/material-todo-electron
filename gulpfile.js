var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var packageJson = require('./package.json');
var usemin = require('gulp-usemin');
var wrap = require('gulp-wrap');
var minifyCss = require('gulp-minify-css');
var minifyJs = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyHTML = require('gulp-minify-html');
var clean = require('gulp-clean');
var rename = require('gulp-rename');


var paths = {
    styles: './assets/css/**/*.*',
    sass: './assets/scss/**/*.scss',
    sounds: './assets/sounds/**/*.*',
    images: './assets/images/**/*.*',
    icons: './assets/icons/**/*.*',
    routes: './routes/**/*',
    resources: './resources/**/*',
    scripts: './app/**/*.js',
    templates: './app/**/*.html',
    // bower_components: './assets/bower_components/**/*.*',
    bower_fonts: './assets/bower_components/**/*.{ttf,woff,woff2,eof,eot,svg}',
    index: 'index.html',
    menu_templates: './menu/**/*.html',
    menu: 'menu.html'
};


gulp.task('sass', function() {
    return gulp.src(paths.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./assets/css'));
});

gulp.task('sass:watch', function() {
    gulp.watch('./assets/scss/**/*.scss', ['sass']);
});


gulp.task('clean', function() {
    gulp.src('src').pipe(clean({ force: true }));
    gulp.src('dist/*.dmg').pipe(clean({ force: true }));
    gulp.src('dist/*.exe').pipe(clean({ force: true }));
    gulp.src('dist/*.msi').pipe(clean({ force: true }));
});


gulp.task('copy', function() {
    gulp.src(paths.index)
        .pipe(usemin({
            js: [minifyJs(), 'concat'],
            css: [minifyCss({
                keepSpecialComments: 0
            }), 'concat'],
            js1: [minifyJs(), 'concat']
        }))
        .pipe(gulp.dest('src'))
    gulp.src(paths.menu)
        .pipe(usemin({
            js: [minifyJs(), 'concat'],
            css: [minifyCss({
                keepSpecialComments: 0
            }), 'concat'],
            js1: [minifyJs(), 'concat']
        }))
        .pipe(gulp.dest('src'))
    gulp.src('./prod.package.json')
        .pipe(rename('package.json'))
        .pipe(gulp.dest('src'))
    gulp.src(paths.routes)
        .pipe(gulp.dest('src/routes'))
    gulp.src(paths.resources)
        .pipe(gulp.dest('src/resources'))
    gulp.src('./main.js')
        .pipe(gulp.dest('src'))
    gulp.src([
            './assets/bower_components/font-awesome/fonts/fontawesome-webfont.*',
            './assets/bower_components/ionic/release/fonts/ionicons.*'
        ])
        .pipe(gulp.dest('src/lib/fonts'))
    gulp.src(paths.templates)
        .pipe(gulp.dest('src/app'))
    gulp.src(paths.menu_templates)
        .pipe(gulp.dest('src/menu'))
    gulp.src(paths.images)
        .pipe(gulp.dest('src/assets/images'))
    gulp.src(paths.icons)
        .pipe(gulp.dest('src/assets/icons'))
    gulp.src(paths.sounds)
        .pipe(gulp.dest('src/assets/sounds'));
});



gulp.task('serve', function() {
    browserSync.init({
        notify: false,
        port: 8081,
        server: "./"
    });

    gulp.watch(['index.html', 'app/**/*.*', 'assets/**/*.*'])
        .on('change', browserSync.reload);
});


gulp.task('dist', ['clean', 'copy']);

gulp.task('dist-mac', function() {
    var appdmg = require('appdmg');
    var ee = appdmg({
        target: './dist/YouProductive.dmg',
        basepath: __dirname,
        specification: {
            "title": "YouProductive",
            "icon": "./assets/icons/64x64.png",
            "background": "./assets/bg/TestBkg.png",
            "icon-size": 64,
            "contents": [
                { "x": 448, "y": 344, "type": "link", "path": "/Applications" },
                { "x": 192, "y": 344, "type": "file", "path": "./dist/YouProductive-darwin-x64/YouProductive.app" },
                { "x": 512, "y": 128, "type": "file", "path": "./dist/YouProductive-darwin-x64/LICENSE" }
            ]
        }
    });

    ee.on('progress', function(info) {
        console.log('info.current: ', info.current);
        console.log('info.total: ', info.total);
        console.log('info.type: ', info.type);
        console.log('info.title: ', info.title);
        console.log('info.status: ', info.status);
    });

    ee.on('finish', function() {
        console.log('There now is a `test.dmg` file');
    });

    ee.on('error', function(err) {
        console.error('An error occurred: ', err);
    });
});

// electron-packager ./src YouProductive --platform=win32 --arch=ia32 --version=0.36.0 --overwrite
// sudo electron-packager ./src YouProductive --platform=darwin --arch=x64 --version=0.36.0 --overwrite


/* BUILDING AND PACKAGING */
// sudo npm run build && sudo npm run dist && sudo npm run build-mac && sudo npm run dist-mac
