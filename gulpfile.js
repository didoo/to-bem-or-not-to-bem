var gulp    = require('gulp');
//var postcss = require('gulp-postcss');
//var scss    = require('postcss-scss');
var sass    = require('gulp-sass');

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
        .pipe(gulp.dest('./build/css/'));

});

gulp.task('watch', function() {
    gulp.watch('./assets/css/**/*.scss', ['css']);
});

gulp.task('default', ['css', 'watch']);