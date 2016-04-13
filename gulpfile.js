
// === PACKAGES ===

// gulp plugins
var gulp         = require('gulp');
var connect      = require('gulp-connect');
var front_matter = require('gulp-front-matter');
var gutil        = require('gulp-util');
var htmlmin      = require('gulp-htmlmin');
var livereload   = require('gulp-livereload');
var postcss      = require('gulp-postcss');
var sass         = require('gulp-sass');
var swig         = require('gulp-swig');

// other plugins
//var _assign = require('lodash.assign');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var del = require('del');


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
        //.pipe(livereload())
        .pipe(connect.reload())
        ;

});

gulp.task('html', function () {

    return gulp.src('./content/**/*')
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
        //.pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(connect.reload())
        .pipe(gulp.dest('./build'))
        ;

        /*
        .pipe(gulpsmith()
            .use(xpress())
            .use(metadata({
                project: 'metadata.json'
            }))
            .use(drafts())
            .use(permalinks({
                linksets: [{
                    match: { collection: 'interviews' },
                    pattern: 'interview__:number--:title',
                }]
            }))
            .use(collections({
                interviews: {
                    pattern: 'interviews/*.html',
                    sortBy: 'number'
                }
            }))
            .use(layouts({
                engine: 'swig',
                // directory: 'layouts',
                // partials: 'partials',
                cache: false
            }))
            // .use(postcss({
            //     input: "assets/css/main.css",
            //     output: "mainpost.css",
            //     plugins: {
            //         'postcss-import': {},
            //         'postcss-simple-vars': {},
            //         'postcss-custom-properties': {},
            //         'postcss-nested': {},
            //         'autoprefixer': { browsers: ['last 2 versions'] }
            //     }
            // }))
        )
        */

});

gulp.task('connect', function() {
    connect.server({
        root: './build',
        //host: 'pippo.lan',
        port: 8888,
        livereload: true
    });
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(['./templates/**/*','./content/**/*'], gulp.series('html'));
    gulp.watch('./assets/scss/**/*.scss', gulp.series('css'));
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


