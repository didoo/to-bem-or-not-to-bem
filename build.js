
var Metalsmith = require('metalsmith');

var collections  = require('metalsmith-collections');
var drafts       = require('metalsmith-drafts');
var ga           = require('metalsmith-google-analytics');
var layouts      = require('metalsmith-layouts');
var permalinks   = require('metalsmith-permalinks');
var postcss      = require('metalsmith-postcss');
var watch        = require('metalsmith-watch');
var xpress       = require('metalsmith-express');

// var assets       = require('metalsmith-assets');
// var moveup       = require('metalsmith-move-up')
// var partial      = require('metalsmith-partial');
// var slug         = require('metalsmith-slug');

var autoprefixer = require('autoprefixer');

/**
 * Build.
 */

Metalsmith(__dirname)
    .source('src/') // content
    .destination('build/') // public
    .use(xpress())
    .use(collections({
        interviews: {
            pattern: 'interviews/*.html',
            sortBy: 'number'
        }
    }))
    .use(permalinks({
        linksets: [{
            match: { collection: 'interviews' },
            pattern: 'interviews/:number-:title',
        }]
    }))
    .use(drafts())
    .use(postcss({
        plugins: {
            // 'postcss-pseudoelements': {}
            // 'postcss-nested': {},
            'autoprefixer': { browsers: ['last 2 versions'] }
        }
    }))
    // .use(assets({
    //     source: 'assets'
    // }))
    // .use(moveup('interviews/*'))
    // .use(inPlace({
    //     // engine: 'swig',
    //     engine: 'handlebars',
    //     cache: false
    // }))
    .use(layouts({
        engine: 'swig', // 'handlebars',
        // directory: 'layouts',
        // partials: 'partials',
        cache: false
    }))
    // .use(slug({
    //     renameFiles: true
    // }))
    // .use(googleAnalytics('API-KEY'))
    .use(watch({
        paths: {
            '${source}/**/*': true,
            'layouts/**/*': '**/*.html',
        },
        livereload: true,
    }))
    .build(function(err){
        if (err) throw err;
    });