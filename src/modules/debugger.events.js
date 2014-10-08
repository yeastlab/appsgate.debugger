// Events.

Debugger.Events = (function (Backbone, _) {
    'use strict';

    var Events = function () {
    };

    _.extend(Events.prototype, Backbone.Events);

    return Events;
})(Backbone, _);

// Allow the `Debugger` object to serve as a global event bus, for folks who
// want global 'pubsub' in a convenient place.
_.extend(Debugger, Backbone.Events);