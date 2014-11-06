({
    appDir: "../",
    baseUrl: "./js",
    dir: "../../www-build",
    paths: {
        mapbox: 'lib/mapbox/mapbox',
        underscore: 'lib/underscore-min',
        geolib: 'lib/geolib.min',
        q: 'lib/q.min',
        console: 'lib/console.min',
        showdown: 'lib/showdown',
        i18next: 'lib/i18next.amd.min',
        ionic: 'lib/ionic/js/ionic.bundle'
    },
    modules: [{
        name: "main"
    }],
    //Allow CSS optimizations. Allowed values:
    //- "standard": @import inlining and removal of comments, unnecessary
    //whitespace and line returns.
    //Removing line returns may have problems in IE, depending on the type
    //of CSS.
    //- "standard.keepLines": like "standard" but keeps line returns.
    //- "none": skip CSS optimizations.
    //- "standard.keepComments": keeps the file comments, but removes line
    //returns.  (r.js 1.0.8+)
    //- "standard.keepComments.keepLines": keeps the file comments and line
    //returns. (r.js 1.0.8+)
    //- "standard.keepWhitespace": like "standard" but keeps unnecessary whitespace.
    optimizeCss: "standard"
})