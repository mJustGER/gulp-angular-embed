"use strict";
/// <reference path="../node_modules/@types/node/index.d.ts" />
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var pluginName = 'gulp-prefixer';
function prefixStream(prefixText) {
    var stream = through();
    stream.write(prefixText);
    return stream;
}
// Plugin level function(dealing with files)
function gulpPrefixer(prefixText) {
    if (!prefixText) {
        throw new PluginError(pluginName, 'Missing prefix text!');
    }
    prefixText = new Buffer(prefixText); // allocate ahead of time
    // Creating a stream through which each file will pass
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }
        if (file.isBuffer()) {
            file.contents = Buffer.concat([prefixText, file.contents]);
        }
        if (file.isStream()) {
            file.contents = file.contents.pipe(prefixStream(prefixText));
        }
        cb(null, file);
    });
}
module.exports = gulpPrefixer;
//# sourceMappingURL=Xgulp-angular-embed.js.map