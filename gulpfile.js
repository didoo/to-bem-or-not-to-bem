// gulp plugins
var gulp         = require('gulp');
var gulpsmith    = require('gulpsmith');
var front_matter = require('gulp-front-matter');
var livereload   = require('gulp-livereload');
var sass         = require('gulp-sass');

//use "gulp-nunjucks" if you need to kill metalsmith!
//var postcss = require('gulp-postcss');

// metalsmith plugins
var collections  = require('metalsmith-collections');
var drafts       = require('metalsmith-drafts');
var layouts      = require('metalsmith-layouts');
var metadata     = require('metalsmith-metadata');
var permalinks   = require('metalsmith-permalinks');
var xpress       = require('metalsmith-express');
var m_watch      = require('metalsmith-watch');
var m_sass       = require('metalsmith-sass');

// other plugins
var _assign      = require('lodash.assign');

gulp.task('css', function () {

    //var processors = [
    //    require('postcss-simple-vars')(),
    //    //require('postcss-custom-properties'),
    //    require('postcss-import')(),
    //    require('postcss-nested')(),
    //    require('postcss-inline-comment')(),
    //    require('postcss-discard-comments')(),
    //    require('autoprefixer')({ browsers: ['last 2 versions'] })
    //];

    return gulp.src('./assets/css/main.scss')
        //.pipe(postcss(processors, { syntax: sass }))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./src/css/'))
        .pipe(livereload())
        ;

});

gulp.task('metal', function () {

    return gulp.src('./src/**/*')
        .pipe(front_matter()).on('data', function(file) {
            _assign(file, file.frontMatter);
            delete file.frontMatter;
        })
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
            .use(m_sass({
                outputStyle: 'expanded',
                outputDir: 'css/'
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
            .use(m_watch({
                paths: {
                    '${source}/**/*': true,
                    'layouts/**/*': '**/*.html',
                },
                livereload: true,
            }))
        )
        .pipe(gulp.dest('./build'))
        ;

});

gulp.task('watch', function() {
    //livereload.listen();
    gulp.watch('./assets/css/**/*.scss', ['css']);
    //gulp.watch('./assets/css/**/*.scss', ['metal']);
});

//gulp.task('default', ['metal', 'css', 'watch']);
gulp.task('default', ['metal']);
