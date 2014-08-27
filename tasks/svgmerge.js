'use strict';

module.exports = function (grunt) {
    'use strict';

    // Node first party libs
    var path = require('path');

    // Third party libs
    var _ = require('lodash');
    var utils = require('./utils').init(grunt);
    var xml2js = require('xml2js');
    var Q = require('q');


    grunt.registerMultiTask('svgmerge', 'Merge multiple SVG files into a single one.', function () {
        var options = this.options({
            useFileNameAsWrappedGroupId: true
        });

        this.files.forEach(function(file) {
            var promises = file.src.filter(function (filepath) {
                // Remove nonexistent files (it's up to you to filter or warn here).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else if (!path.extname(filepath) === '.svg') {
                    grunt.log.warn('Source file "' + filepath + '" is not an SVG file.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                // Return string optimized version of SVG.
                return utils.xml2js(filepath, options.svgo, {
                    with_filename: true
                });
            });

            Q.allSettled(promises).then(function (processed) {
                // collect all nodes
                var nodes = [];

                processed.forEach(function (result) {
                    if (result.state === "fulfilled") {
                        // collect all children of SVG except defs
                        var children = _.omit(result.value.data.svg, function(value, key) {
                            return _.contains(['$', '@', 'defs'], key);
                        });

                        // wrap it around a group
                        var node = { 'g': children };

                        // set an id if required
                        if (options.useFileNameAsWrappedGroupId) {
                            node.g = _.extend(node.g, { '$': { id: path.basename(result.value.filename, '.svg') }});
                        }

                        // export as XML string
                        nodes.push(node);
                    } else {
                        grunt.log.warn("Unable to process due to " + result.reason);
                    }
                });

                // create xml2js builder
                var builder = new xml2js.Builder({
                    pretty: true,
                    rootName: 'svg'
                });

                // xml output
                var xml = builder.buildObject({
                    'defs': { 'g': _.map(nodes, function(n) { return n.g }) },
                    '$': {
                        'xmlns': 'http://www.w3.org/2000/svg',
                        'xmlns:xlink': 'http://www.w3.org/1999/xlink'
                    }
                });
                grunt.file.write(file.dest, xml);
            });
        });
    });
};