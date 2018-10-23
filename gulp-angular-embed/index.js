'use strict';
var through = require('through2');
var gutil = require('gulp-util');
var fs = require("fs");
var path = require('path');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-angular-embed';

function getStyleSheetsContent(file, fileContent) {
    var filePath = path.dirname(file.path);
    var StyleSheetContent = "";

    // Search for TemplateUrlTag
    var StyleUrlTagReslut = fileContent.toString().match(/styleUrls.+\[.*\]/igm);
    if (StyleUrlTagReslut) {
        var StyleUrls = StyleUrlTagReslut.toString().match(/(['"])[^'"]*\1/igm);
        var i;
        for (i = 0; i < StyleUrls.length; i++) {
            StyleUrls[i] = StyleUrls[i].replace("'", "").replace("'", "").trim()

            // Get content of the Html templateFile
            StyleSheetContent += fs.readFileSync(filePath + "/" + StyleUrls[i]);
            StyleSheetContent = StyleSheetContent
                .replace(/(\r\n|\n|\r)/gm, "")
                .replace("\'", "\\\'")
                .replace("\"", "\\\"");
        }

        return StyleSheetContent.toString().trim();
    }
    
    return '';
}

function getHtmlTemplateContent(file, fileContent) {
    // Search for TemplateUrlTag
    var TemplateUrlTagReslut = fileContent.toString().match(/templateUrl\s*:\s(['"])[^'",]*\1/igm);
    if (TemplateUrlTagReslut) {
        // Get and store templateTag and templateUrl
        var TemplateUrlTag = TemplateUrlTagReslut.toString().split(":");
        TemplateUrlTag[1] = TemplateUrlTag[1].replace("'", "").replace("'", "").trim();
        // Get content of the Html templateFile
        
        var filePath = path.join(file.base, '..', TemplateUrlTag[1]);
        var htmlTemplateContent = fs.readFileSync(filePath);
        htmlTemplateContent = htmlTemplateContent.toString()
            .replace(/(\r\n|\n|\r|\s\s)/gm, "")
            .replace(/\'/gm, "\\\'")
            .replace(/\"/gm, "\\\"")
            .trim();

        return htmlTemplateContent;
    }
    
    return '';
}

var gulpAngularEmbed = function () {
    return through.obj(function (file, enc, callback) {

        var isBuffer = false, inputString = null, result = null, outBuffer = null;

        //Empty file and directory not supported
        if (file === null || file.isDirectory()) { this.push(file); return callback(); }

        isBuffer = file.isBuffer();
        if (isBuffer) {

            var fileContent = new String(file.contents);
             
            // get htmlTemplate an embed it into the angularJs component file
            var HtmlTemplateContent = getHtmlTemplateContent(file, fileContent)
            var fileContent = fileContent.toString().replace(/templateUrl\s*:\s(['"])[^'",]*\1/igm, "template: \"" + HtmlTemplateContent + "\"");
             
            // get styleSheets an embed it into the angularJs component file
            var StyleSheetContent = getStyleSheetsContent(file, fileContent)
            var fileContent = fileContent.toString().replace(/styleUrls.+\[.*\]/igm, "styles: ['" + StyleSheetContent + "']");
             

            outBuffer = new Buffer(fileContent);
            var newFile = new gutil.File();
            newFile.path = file.path;
            newFile.contents = outBuffer;
            callback(null, newFile);
        } else {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Only Buffer format is supported'));
            callback();
        }
    });
};
//Export the Method
module.exports = gulpAngularEmbed;