'use strict';

module.exports = function (grunt) {
    'use strict';

    var path = require('path');
    var utils = require('./utils').init(grunt);

    grunt.registerMultiTask('variablize', 'Turn SVG file into js variable.', function () {
        var options = this.options();

        var src = this.data.src  || grunt.log.error('`src` is not defined');
        var dest = this.data.dest || grunt.log.error('`dest` is not defined.');
        var variable = this.data.variable || grunt.log.error('`variable` is not defined.');

        if (!grunt.file.exists(src)) {
            grunt.log.warn("File "+src+" does not appear to exist.");
        }

        if (path.extname(src) === '.svg') {
            var xml_as_string = utils.xml2String(src, options.svgo).then(function(data) {
                var output = "var " + variable + " = '" + data + "';";
                grunt.file.write(dest, output);
            });
        } else {
            grunt.log.warn("Source file specified by `src` must be an SVG file.")
        }
    });
};