'use strict';
var through = require('through2');
var gutil = require('gulp-util');
var fs = require("fs");
var path = require('path');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-angular-embed';

/**
 * This method is used for transforming the text to the target type.
 * @param caseType
 */
var AngularEmbed = function () {
    return through.obj(function (file, enc, callback) {

        var isBuffer = false;
        var inputString = null;
        var result = null;
        var outBuffer = null;

        //Empty file and directory not supported
        if (file === null || file.isDirectory()) { this.push(file); return callback(); }

        isBuffer = file.isBuffer();
        if (isBuffer) {

            // Store fileconent of current file as string
            inputString = new String(file.contents);

            // Search for templateTag and templateUrl
            result = inputString.toString().match(/(templateUrl(.+?)["|']([^'|"]+.))/igm);

            // Store templateTag and templateUrl for reuse later
            var templateUrl = result.toString().split(":");
            templateUrl[1] = templateUrl[1].replace("'", "").replace("'", "").trim();

            var pathToFile = path.dirname(file.path);
             
            // Get Conent of the HTML-templateFile
            result = fs.readFileSync(pathToFile + "/" + templateUrl[1]);
            var newFile = inputString.toString().replace(/(templateUrl(.+?)["|']([^'|"]+.))/igm, "template:`" + result + "`");
             

            outBuffer = new Buffer(newFile.toString());
            var aFile = new gutil.File();
            aFile.path = file.path;
            aFile.contents = outBuffer;
            callback(null, aFile);
        } else {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Only Buffer format is supported'));
            callback();
        }
    });
};
//Export the Method
module.exports = GulpText;