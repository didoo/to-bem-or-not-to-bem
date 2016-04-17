
// === PACKAGES ===

// gulp plugins
var gulp         = require('gulp');
var cheerio      = require('gulp-cheerio');
var connect      = require('gulp-connect');
var front_matter = require('gulp-front-matter');
var gutil        = require('gulp-util');
var htmlmin      = require('gulp-htmlmin');
var livereload   = require('gulp-livereload');
var postcss      = require('gulp-postcss');
var sass         = require('gulp-sass');
var swig         = require('gulp-swig');

// other plugins
var autoprefixer = require('autoprefixer');
var cssnano      = require('cssnano');
var del          = require('del');


// === TASKS ===

// gulp.task('convert', function () {
//     return gulp.src('./raws/*.html')
//         .pipe(cheerio(function ($, file) {
//             $('.DMConversation-content .DirectMessage-message .DirectMessage-text').each(function () {
//                 console.log();
//             });
//         }))
//         .pipe(gulp.dest('./raw_out/'))
//         ;
// });

gulp.task('css', function () {

    var processors = [
        //cssnano()
        autoprefixer({browsers: ['> 1%']})
    ];

    return gulp.src('./assets/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./build/css/'))
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
        //.pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(connect.reload())
        .pipe(gulp.dest('./build'))
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
    gulp.watch(['./templates/**/*','./content/**/*'], gulp.series('html'));
    gulp.watch('./assets/scss/**/*.scss', gulp.series('css'));
    done();
});

gulp.task('clean', function() {
    return del(['./build/**/*']);
});


// === MAIN RUNNER ===

gulp.task('default',
    gulp.series(
        'clean',
        gulp.parallel('html', 'css'),
        'connect',
        'watch'
    )
);
