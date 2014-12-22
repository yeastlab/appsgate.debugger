/**
 * Created by barraq on 8/20/14.
 */

'use strict';

exports.init = function(grunt) {
    var exports = {};

    // Third party libs
    var Q = require('q');
    var _ = require('lodash');
    var SVGO = require('svgo');
    var xml2js = require('xml2js');

    /**
     * Optimize and return content of an XML file as a String.
     *
     * @param filename Filename to process
     * @param config SVGO configuration.
     * @param options
     * @returns {*}
     */
    var xml2string = exports.xml2String = function(filename, config, options) {
        var deferred = Q.defer();
        var options = _.defaults({}, options, {
            with_filename: false
        });

        var svgo = new SVGO(config || {
            full: true,
            plugins: [
                { cleanupAttrs: true },
                { removeComments: true },
                { removeDoctype: true },
                { removeUnusedNS: true},
                { removeXMLProcInst: true },
                { removeMetadata: true },
                { removeEditorsNSData: true },
                { removeComments: true }
            ]
        });

        svgo.optimize(grunt.file.read(filename), function (result) {
            deferred.resolve(options.with_filename ? { filename: filename, data: result.data } : result.data);
        });

        return deferred.promise;
    };

    /**
     * Optimize and return content of an XML file as a JavaScript object.
     *
     * @param filename Filename to process
     * @param config SVGO configuration.
     * @param options
     * @returns {*}
     */
    exports.xml2js = function(filename, config, options) {
        var deferred = Q.defer();
        var options = _.defaults({}, options, {
            with_filename: false
        });

        xml2string(filename, config).then(function (result) {
            xml2js.parseString(result, function(err, object) {
                deferred.resolve(options.with_filename ? { filename: filename, data: object } : object);
            });
        });

        return deferred.promise;
    };

    /**
     * Escape JavaScript string.
     *
     * @param content Content to be escaped
     * @returns {String} The content escaped.
     */
    exports.jsEscape = function (content) {
        return content.replace(/(['\\])/g, '\\$1')
            .replace(/[\f]/g, "\\f")
            .replace(/[\b]/g, "\\b")
            .replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t")
            .replace(/[\r]/g, "\\r")
            .replace(/[\u2028]/g, "\\u2028")
            .replace(/[\u2029]/g, "\\u2029");
    };

    return exports;
};