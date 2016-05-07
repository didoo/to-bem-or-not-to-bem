
// === PACKAGES ===

// gulp plugins
var gulp         = require('gulp');
var cheerio      = require('gulp-cheerio');
var connect      = require('gulp-connect');
var front_matter = require('gulp-front-matter');
var gutil        = require('gulp-util');
var htmlmin      = require('gulp-htmlmin');
var imagemin     = require('gulp-imagemin');
var livereload   = require('gulp-livereload');
var prettify     = require('gulp-prettify');
var postcss      = require('gulp-postcss');
var rename       = require("gulp-rename");
var sass         = require('gulp-sass');
var swig         = require('gulp-swig');

// other plugins
var pngquant     = require('imagemin-pngquant');
var mqpacker     = require('css-mqpacker')();
var autoprefixer = require('autoprefixer');
var cssnano      = require('cssnano');
var del          = require('del');
var ftp          = require('vinyl-ftp');

// debugging tools
// var using        = require('gulp-using');    // use: .pipe(using({ prefix:'Using', color:'blue' }))
// var filelog      = require('gulp-filelog');  // use: .pipe(filelog())


// === CONFIG ===

var _config = require('./config.js');


// === TASKS ===

gulp.task('convert', function () {
    return gulp.src('./raws/*.html')
        .pipe(cheerio({
            run: function ($, file) {
                $('.DirectMessage').each(function(i,dm) {
                    var kind;
                    var $dm = $(this);
                    if($dm.hasClass('DirectMessage--sent')){
                        kind = 'question';
                    } else if($dm.hasClass('DirectMessage--received')){
                        kind = 'answer';
                    }
                    $dm.attr('class','dialog dialog--' + kind);
                    $dm.removeAttr('data-message-id');
                    $dm.removeAttr('data-component-context');
                    $dm.append(
                        $dm.find('.DirectMessage-message .DirectMessage-text p')
                        .removeAttr('class')
                        .removeAttr('lang')
                        .removeAttr('data-aria-label-part')
                    );
                    $dm.find('.DirectMessage-message').remove();
                    $dm.find('p a').each(function(i,a) {
                        var url = $(this).attr('data-expanded-url');
                        $(this).replaceWith($('<a href="' + url + '">' + url + '</a>'));
                    });
                });
                $('.DirectMessage-avatar').remove();
                $('.DirectMessage-actions').remove();
                $('.DirectMessage-footer').remove();
                $('.DirectMessage-container').remove();
            },
            parserOptions: {
                normalizeWhitespace: true,
                decodeEntities: true
            }
        }))
        .pipe(prettify({indent_size: 4}))
        .pipe(rename({suffix:".clean"}))
        .pipe(gulp.dest('./raws_out/'))
        ;
});

gulp.task('css', function () {

    return gulp.src('./assets/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./build/css/'))
        .pipe(postcss([
            mqpacker,
            autoprefixer({
                browsers: [
                    'iOS >= 6',
                    'Android >= 2',
                    'Explorer >= 9'
                ]
            }),
            cssnano({
                autoprefixer: false,
                minifyFontValues: false
            })
        ]))
        .pipe(rename({suffix:".min"}))
        .pipe(gulp.dest('./build/css/'))
        .pipe(connect.reload())
        ;

});

gulp.task('images', function () {

    return gulp.src('./assets/img/*.{jpg,png,gif}')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/img/'))
        .pipe(connect.reload())
        ;

});

gulp.task('html', function () {

    var data = require('./content/metadata.json');

    return gulp.src('./content/**/*.html')
        .pipe(front_matter({
            property: 'data',
            remove: true
        }))
        .pipe(swig({
            // really needed ?
            load_json: true,
            json_path: './contents/metadata.json',
            defaults: {
                locals: data || {},
                cache: false
            }
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(connect.reload())
        .pipe(gulp.dest('./build'))
        ;
});

gulp.task('deploy', function () {

    var ftpconn = ftp.create({
        host: _config.ftp_host,
        user: _config.ftp_user,
        password: _config.ftp_password,
        parallel: 10,
        log: gutil.log
    });

    return gulp.src( './build/**/*.*', { base: './build', buffer: false } ) // turn off buffering in gulp.src for best performance
        .pipe(ftpconn.newerOrDifferentSize(_config.ftp_dest)) // only upload files newer or with different file size
        .pipe(ftpconn.dest(_config.ftp_dest))
        ;

});

gulp.task('connect', function(done) {
    connect.server({
        root: './build',
        port: 8888,
        livereload: true
    });
    done();
});

gulp.task('watch', function(done) {
    gulp.watch(['./templates/**/*','./content/**/*'], gulp.series('html','deploy'));
    gulp.watch('./assets/scss/**/*.scss', gulp.series('css','deploy'));
    gulp.watch('./assets/img/**/*.{jpg|png|gif}', gulp.series('images','deploy'));
    done();
});

gulp.task('clean', function() {
    return del(['./build/**/*']);
});


// === MAIN RUNNER ===

gulp.task('default',
    gulp.series(
        'clean',
        gulp.parallel('html', 'css', 'images'),
        'deploy',
        'connect',
        'watch'
    )
);
