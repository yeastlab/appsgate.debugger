'use strict';

module.exports = function (grunt) {
    'use strict';

    var fs = require('fs');
    var _ = require('lodash');
    var path = require('path');
    var utils = require('./utils').init(grunt);

    grunt.registerMultiTask('variablize', 'Turn file into js variable.', function () {
        var globals = this.options({
            encoding: 'utf8'
        });

        this.files.forEach(function(file) {
            var src = file.src[0] || grunt.log.error('`src` is not defined');
            var dest = file.dest || grunt.log.error('`dest` is not defined.');
            var variable = file.variable || grunt.log.error('`variable` is not defined.');
            var options = _.merge({}, globals, file.options || {});

            if (!grunt.file.exists(src)) {
                grunt.log.warn("File " + src + " does not appear to exist.");
            }

            if (path.extname(src) === '.svg') {
                var xml_as_string = utils.xml2String(src, options.svgo).then(function (data) {
                    var output = "var " + variable + " = '" + data + "';";
                    grunt.file.write(dest, output);
                });
            } else {
                var src_as_string = fs.readFileSync(src, options.encoding);
                var output = "var " + variable + " = '" + utils.jsEscape(src_as_string) + "';";
                grunt.file.write(dest, output);
            }
        });
    });
};