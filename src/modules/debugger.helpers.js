/**
 * Helpers
 */

/**
 * Throw a *message* error.
 *
 * @param message
 * @param name
 */
function throwError(message, args) {
    var error = new Error(_.template(message, args || {}, { interpolate: /\#\{(.+?)\}/g }));
    error.name = 'Error';
    throw error;
}

/**
 * Sluggify a *text*.
 *
 * This function replace space by - and remove all non ascii characters.
 *
 * @param text Text to sluggify.
 * @returns {string} Sluggified text.
 */
function sluggify(text) {
    return String(text).toLowerCase().replace(RegExp(" ", "g"), "-").replace(/[^\w-]+/g, "")
}

/**
 * Parse boolean from a string or a boolean
 * @param string The value to parse. If string is not a string, then it is converted to one.
 * Leading whitespace in the string is ignored.
 * @returns {boolean}
 */
function parseBoolean(string) {
    return /^true$/i.test(string);
}

/**
 * Ensure that some property is defined and not empty.
 *
 * If a `value` is provided as third arguments then it also check that the value
 * referred by propertyPath is equal to `value`.
 *
 * @param object Object to which this property belongs to
 * @param propertyPath Path to the property (e.g. some.property.name)
 * @returns {boolean}
 */
function ensure(object, propertyPath) {
    var properties = propertyPath.split('.');
    while (properties.length) {
        var property = properties.shift();
        if (_.isObject(object) && object.hasOwnProperty(property) && !_.isEmpty(object[property])) {
            object = object[property];
        }
        else {
            return false;
        }
    }

    if (arguments.length == 2) {
        return true;
    } else {
        return object === _.last(arguments);
    }
}

/**
 * Check if object is missing some (sub)property.
 *
 * @param object Object from which this property should belongs to
 * @param propertyPath Path to the property (e.g. some.property.name)
 * @returns {boolean}
 */
function missing(object, propertyPath) {
    return !ensure(object, propertyPath);
}

/**
 * Trigger an event and/or a corresponding method name.
 *
 * `this.triggerMethod('foo')` will trigger the 'foo' event and
 * call the 'onFoo' method.
 *
 * `this.triggerMethod('foo:bar')` will trigger the 'foo:bar' event and
 * call the 'onFooBar' method.
 *
 * @copyright Marionette.triggerMethod:
 */
Debugger.triggerMethod = (function () {

    // split the event name on the ':'
    var splitter = /(^|:)(\w)/gi;

    // take the event section ('section1:section2:section3')
    // and turn it in to uppercase name
    function getEventName(match, prefix, eventName) {
        return eventName.toUpperCase();
    }

    // actual triggerMethod implementation
    var triggerMethod = function (event) {
        // get the method name from the event name
        var methodName = 'on' + event.replace(splitter, getEventName);
        var method = this[methodName];
        var result;

        // call the onMethodName if it exists
        if (_.isFunction(method)) {
            // pass all arguments, except the event name
            result = method.apply(this, _.tail(arguments));
        }

        // trigger the event, if a trigger method exists
        if (_.isFunction(this.trigger)) {
            this.trigger.apply(this, arguments);
        }

        return result;
    };

    return triggerMethod;
})();

Debugger.SmartBuffer = (function () {

    var SmartBuffer = function (options) {
        this.data = [];
        this.options = _.defaults({}, options, {
            pairing: false,
            shadowing: false,
            ignoreData: false
        });
    };

    _.extend(SmartBuffer.prototype, {
        concat: function (bulk) {
            //@todo optimize...
            var self = this;
            _.each(bulk, function (f) {
                self.push.apply(self, f);
            });
        },

        push: function (timestamp, data) {
            // in case we just keep track of timestamp
            if (this.options.ignoreData) {
                this.data.push({
                    timestamp: timestamp
                });
                return;
            }

            // return if not data and frame is undefined
            if (_.isEmpty(this.data) && _.isUndefined(data)) {
                return;
            }

            if (this.options.pairing) {
                if (!_.isUndefined(data) && _.isEmpty(this.data)) {
                    this.data.push({
                        timestamp: timestamp,
                        data: data,
                        next: {
                            timestamp: timestamp,
                            data: data
                        }
                    });
                } else if (!_.isUndefined(data)) {
                    // replace previous shadow
                    this.data[this.size() - 1].next = {
                        timestamp: timestamp,
                        data: data
                    };
                    // push a new frame
                    this.data.push({
                        timestamp: timestamp,
                        data: data,
                        next: {
                            timestamp: timestamp,
                            data: data
                        }
                    });
                } else {
                    // update shadow timestamp
                    this.data[this.size() - 1].next.timestamp = timestamp;
                }
            } else {
                if (!_.isUndefined(data) && this._lastIsShadow) {
                    // replace shadow by new frame
                    this.data[this.size() - 1] = {
                        timestamp: timestamp,
                        data: data
                    };
                    // last is not a shadow anymore
                    this._lastIsShadow = false;
                } else if (_.isUndefined(data) && this._lastIsShadow) {
                    // update shadow timestamp
                    this.data[this.size() - 1].timestamp = timestamp;
                } else if (!_.isUndefined(data)) {
                    // push new data
                    this.data.push({
                        timestamp: timestamp,
                        data: data
                    });
                } else {
                    // push a shadow
                    this.data.push({
                        timestamp: timestamp,
                        data: this.data[this.size() - 1].data
                    });
                    // make last a shadow
                    this._lastIsShadow = true;
                }
            }
        },

        all: function () {
            return this.data;
        },

        first: function() {
            return _.first(this.data);
        },

        last: function() {
            return _.last(this.data);
        },

        select: function (predicate) {
            return _.filter(this.data, predicate);
        },

        reject: function (predicate) {
            return _.reject(this.data, predicate);
        },

        domain: function (dateFn) {
            if (_.isUndefined(this.data)) return null;

            dateFn || (dateFn = function (d) {
                return d;
            });

            var min = this.data[0];
            var max = _.max(this.data, function (d) {
                return d.next ? d.next.timestamp : d.timestamp
            });

            return [dateFn(min.timestamp), dateFn(max.next ? max.next.timestamp : max.timestamp)];
        },

        /**
         * Return frame from buffered data that match a given `timestamp`.
         *
         * @param timestamp Timestamp used to find the frame.
         * @returns {Object} the frame matching the timestamp or null if no match found.
         */
        at: function (timestamp) {
            if (this.options.pairing) {
                return _.findLast(this.data, function (frame) {
                    return frame.timestamp <= timestamp && timestamp <= frame.next.timestamp;
                });
            } else {
                return _.findLast(this.data, function (frame) {
                    return frame.timestamp == timestamp;
                });
            }
        },

        /**
         * Return frame inside a timestamp `range`, if multiple frames match then the one
         * closest to the boundary on the `direction` side will be returned.
         *
         * @param range Timestamp range
         * @param direction Lookup direction
         * @returns {*} the frame matching the timestamp `range` or null if no match found.
         */
        inside: function (range, direction) {
            // the lookup function depends on the lookup direction
            var lookup = direction == 'left' ? _.find : _.findLast;

            if (this.options.pairing) {
                return lookup.call(this, this.data, function (frame) {
                    return (range[0] <= frame.timestamp && frame.timestamp <= range[1])
                        || (range[0] <= frame.next.timestamp && frame.next.timestamp <= range[1])
                        || (frame.timestamp <= range[0] && range[1] <= frame.next.timestamp);
                });
            } else {
                return lookup.call(this, this.data, function (frame) {
                    return range[0] <= frame.timestamp && frame.timestamp <= range[1];
                });
            }
        },

        size: function () {
            return this.data.length;
        }
    });

    return SmartBuffer;
})();