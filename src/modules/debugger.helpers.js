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
 * Deep version of lodash _.defaults
 * @type {Function}
 */
var defaultsDeep = _.partialRight(_.merge, function recursiveDefaults ( /* ... */ ) {
    // Ensure dates and arrays are not recursively merged
    if (_.isArray(arguments[0]) || _.isDate(arguments[0])) {
        return arguments[0];
    }
    return _.merge(arguments[0], arguments[1], recursiveDefaults);
});

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


/**
 * Smart buffer implementation.
 *
 * The SmartBuffer can buffer data intelligently using various techniques:
 * - standard (default) - behave like a standard queue
 * - pairing - pair buffered data two by two
 * - shadowing - shadow last element when needed
 * - ignoreData - just keep timestamp and ignore data
 */
Debugger.SmartBuffer = (function () {

    var SmartBuffer = function (options) {
        this._buffer = [];
        this.options = defaultsDeep({}, options, {
            pairing: false,
            shadowing: false,
            ignoreData: false
        });
    };

    _.extend(SmartBuffer.prototype, {
        /**
         * Contact
         * @param bulk
         */
        concat: function (bulk) {
            var self = this;
            _.each(bulk, function (f) {
                this.push.apply(self, f);
            }, this);
        },

        /**
         * Push new `data` with given `timestamp`.
         * @param timestamp
         * @param data
         */
        push: function (timestamp, data) {
            // in case we just keep track of timestamp
            if (this.options.ignoreData) {
                this._buffer.push({
                    timestamp: timestamp
                });
                return;
            }

            // return if buffer is empty and data is undefined
            if (_.isEmpty(this._buffer) && _.isUndefined(data)) {
                return;
            }

            if (this.options.pairing) {
                // in case we are pairing data
                if (data !== undefined && _.isEmpty(this._buffer)) {
                    // if buffer is empty just push the new data
                    this._buffer.push({
                        timestamp: timestamp,
                        data: data,
                        next: this.options.shadowing? {
                            timestamp: timestamp,
                            data: data
                        } : null
                    });
                } else if (data !== undefined) {
                    // set previous.next
                    this._buffer[this.size() - 1].next = {
                        timestamp: timestamp,
                        data: data
                    };
                    // push a new frame
                    this._buffer.push({
                        timestamp: timestamp,
                        data: data,
                        next: this.options.shadowing? {
                            timestamp: timestamp,
                            data: data
                        } : null
                    });
                } else if (this.options.shadowing)  {
                    // if shadowing then update shadow timestamp
                    this._buffer[this.size() - 1].next.timestamp = timestamp;
                }
            } else {
                // pairing is not activated
                if (data !== undefined && this._lastIsShadow) {
                    // replace shadow by new frame if shadowing is activated
                    this._buffer[this.size() - 1] = {
                        timestamp: timestamp,
                        data: data
                    };
                    // last is not a shadow anymore
                    this._lastIsShadow = false;
                } else if (data !== undefined && this._lastIsShadow) {
                    // update shadow timestamp if shadowing is activated
                    this._buffer[this.size() - 1].timestamp = timestamp;
                } else if (data !== undefined) {
                    // push new data
                    this._buffer.push({
                        timestamp: timestamp,
                        data: data
                    });
                } else if (this.options.shadowing) {
                    // push a shadow if shadowing is activated
                    this._buffer.push({
                        timestamp: timestamp,
                        data: this._buffer[this.size() - 1].data
                    });
                    // make last a shadow
                    this._lastIsShadow = true;
                }
            }
        },

        all: function () {
            return this._buffer;
        },

        first: function() {
            return _.first(this._buffer);
        },

        last: function() {
            return _.last(this._buffer);
        },

        select: function (predicate) {
            return _.filter(this._buffer, predicate);
        },

        reject: function (predicate) {
            return _.reject(this._buffer, predicate);
        },

        domain: function (dateFn) {
            if (_.isUndefined(this._buffer)) return null;

            dateFn || (dateFn = function (d) {
                return d;
            });

            var min = this._buffer[0];
            var max = _.max(this._buffer, function (d) {
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
                return _.findLast(this._buffer, function (frame) {
                    return frame.timestamp <= timestamp && timestamp <= frame.next.timestamp;
                });
            } else {
                return _.findLast(this._buffer, function (frame) {
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
                return lookup.call(this, this._buffer, function (frame) {
                    return (range[0] <= frame.timestamp && frame.timestamp <= range[1])
                        || (frame.next && range[0] <= frame.next.timestamp && frame.next.timestamp <= range[1])
                        || (frame.timestamp <= range[0] && frame.next && range[1] <= frame.next.timestamp);
                });
            } else {
                return lookup.call(this, this._buffer, function (frame) {
                    return range[0] <= frame.timestamp && frame.timestamp <= range[1];
                });
            }
        },

        /**
         * Return size of the buffer.
         *
         * @returns {Number}
         */
        size: function () {
            return this._buffer.length;
        },

        /**
         * Clear the buffer.
         */
        clear: function() {
            // we don't use this._buffer = [] here cause there can be other references
            // to this array in the code.
            while(this._buffer.length > 0) {
                this._buffer.pop();
            }
        }
    });

    return SmartBuffer;
})();