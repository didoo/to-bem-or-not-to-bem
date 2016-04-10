
var Metalsmith = require('metalsmith');

var assets       = require('metalsmith-assets');
var collections  = require('metalsmith-collections');
var drafts       = require('metalsmith-drafts');
var ga           = require('metalsmith-google-analytics');
var layouts      = require('metalsmith-layouts');
var metadata     = require('metalsmith-metadata');
var permalinks   = require('metalsmith-permalinks');
var postcss      = require('metalsmith-postcss');
var watch        = require('metalsmith-watch');
var xpress       = require('metalsmith-express');

// var moveup       = require('metalsmith-move-up')
// var partial      = require('metalsmith-partial');
// var slug         = require('metalsmith-slug');
// var slug         = require('metalsmith-slug');
// var inPlace      = require('metalsmith-in-place');


// var autoprefixer = require('autoprefixer');
// var pcssImport   = require('postcss-import');
// var pcssSimpleVars = require('postcss-simple-vars');
// var pcssCustomProperties = require('postcss-custom-properties');
// var pcssNested   = require('postcss-nested');
// require('postcss-inline-comment')

/**
 * Build.
 */

Metalsmith(__dirname)
    .source('src/') // content
    .destination('build/') // public
    .use(xpress())
    .use(metadata({
        project: 'metadata.json'
    }))
    .use(drafts())
    .use(permalinks({
        linksets: [{
            match: { collection: 'interviews' },
            pattern: 'interviews/:number-:title',
        }]
    }))
    .use(collections({
        interviews: {
            pattern: 'interviews/*.html',
            sortBy: 'number'
        }
    }))
    .use(layouts({
        engine: 'swig', // 'handlebars',
        // directory: 'layouts',
        // partials: 'partials',
        cache: false
    }))
    // .use(slug({
    //     renameFiles: true
    // }))
    .use(postcss({
        input: "assets/css/main.css",
        output: "mainpost.css",
        plugins: {
            'postcss-import': {},
            'postcss-simple-vars': {},
            'postcss-custom-properties': {},
            'postcss-nested': {},
            'autoprefixer': { browsers: ['last 2 versions'] }
        }
    }))
    .use(assets({
        source: './assets',
        destination: './'
    }))
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

module.exports = function (filename, options) {
    var md = options.data.root;
    for (i in md) {
        console.log(i + " | " + md[i]);
    }
};