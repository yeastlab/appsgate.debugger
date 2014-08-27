(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['backbone', 'jquery', 'underscore', 'd3'], function(Backbone, $, _, d3) {
            return (root.AppsGateDebugger = factory(root, Backbone, $, _, d3));
        });
    } else {
        // Browser globals
        root.AppsGateDebugger = factory(root, root.Backbone, root.$, root._, root.d3);
    }
}(this, function(root, Backbone, $, _, d3) {
    'use strict';

    var previousDebugger = root.AppsGateDebugger;

    var Debugger = {};

    Debugger.VERSION = '<%= version %>';

    Debugger.noConflict = function() {
        root.AppsGateDebugger = previousDebugger;
        return this;
    };

    // borrow Backbone.extend;
    Debugger.extend = Backbone.Model.extend;

    // @include ../.tmp/gen/themes/basic/base.svg.js

    // @include modules/debugger.helpers.js
    // @include modules/debugger.logger.js
    // @include modules/debugger.events.js

    // @include modules/debugger.connector.js

    // @ifdef DEVTOOLS
    // @include modules/debugger.devtools.js
    // @endif

    // @include modules/debugger.dashboard.js
    // @include modules/debugger.widgets.js

    return Debugger;
}));