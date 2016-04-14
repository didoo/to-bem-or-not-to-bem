
// === PACKAGES ===

// gulp plugins
var gulp         = require('gulp');
var connect      = require('gulp-connect');
var front_matter = require('gulp-front-matter');
var gutil        = require('gulp-util');
var htmlmin      = require('gulp-htmlmin');
var livereload   = require('gulp-livereload');
var postcss      = require('gulp-postcss');
var rename       = require("gulp-rename");
var sass         = require('gulp-sass');
var swig         = require('gulp-swig');
var tap          = require('gulp-tap'); // use: .pipe(tap(function(file,t) { console.log('lorem'); }))

// other plugins
var autoprefixer = require('autoprefixer');
var cssnano      = require('cssnano');
var del          = require('del');


// === INITIALISE ===

var _project = require('./content/metadata.json');

// === TASKS ===

gulp.task('css', function () {

    var processors = [
        //cssnano()
        autoprefixer({browsers: ['last 2 versions']})
    ];

    return gulp.src('./assets/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./build/css/'))
        .pipe(connect.reload())
        ;

});

gulp.task('html', function () {

    return gulp.src('./content/**/*.html')
        //.pipe(front_matter()).on('data', function(file) {
        //    _assign(file, file.frontMatter);
        //    delete file.frontMatter;
        //})
        .pipe(front_matter({
            property: 'data',
            remove: true
        }))
        .pipe(swig({
            defaults: { cache: false },
            load_json: true,
            json_path: './contents/metadata.json'
        }))
        //.pipe(tap(function(file,opts) {
        //    console.log(file);
        //    console.log(JSON.stringify(opts.data));
        //}))
        //.pipe(rename(function(filepath,opts){
        //    // 01__interview-with--christoph__reinartz
        //    filepath.basename = opts.data.number + '__interview-with--' + opts.data.nameslug
        //}))
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


