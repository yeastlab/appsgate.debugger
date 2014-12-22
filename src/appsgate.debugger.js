(function (root, factory) {
    // Setup AppsGate.Debugger appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'jquery', 'underscore', 'd3', 'i18n', 'exports'], function(Backbone, $, _, d3, i18n, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global AppsGateDebugger.
            return (root.AppsGateDebugger = factory(root, exports, Backbone, $, _, d3, i18n));
        });
    } else {
        // Else, as a browser global.
        root.AppsGateDebugger = factory(root, {}, root.Backbone, root.$, root._, root.d3, root.i18n);
    }
}(this, function(root, Debugger, Backbone, $, _, d3, i18n) {
    'use strict';

    // Initial Setup
    // -------------

    // Save the previous value of the AppsGateDebugger variable, so that it can be restored later on, if noConflict is used.
    var previousDebugger = root.AppsGateDebugger;

    // Current version of the library. Keep in sync with package.json.
    Debugger.VERSION = '{%= version %}';

    // Runs AppsGate.Debugger.js in noConflict mode, returning the AppsGateDebugger variable to its previous owner.
    // Returns a reference to this AppsGateDebugger object.
    Debugger.noConflict = function() {
        root.AppsGateDebugger = previousDebugger;
        return this;
    };

    // Borrow Backbone.extend function.
    Debugger.extend = Backbone.Model.extend;

    // Inline include of SVG file for faster loading.
    // @include ../.tmp/gen/themes/basic/base.svg.js

    // Inline include of theme config files
    // @include ../.tmp/gen/themes/basic/theme.config.js

    // Inline include of templates files.
    // @include ../.tmp/gen/templates/decorations.html.tpl.js

    // Inline include of templates files.
    // @include ../.tmp/gen/templates/decorations.txt.tpl.js

    Debugger.themes = {
        basic: THEMES_BASIC
    };

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