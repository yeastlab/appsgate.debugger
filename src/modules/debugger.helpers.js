// Helpers
// -------

// Throw an error *message*.
// The `message` can be formatted with extra arguments given by `args`.
//
//     throwError('some {error} with {stack}', { error: e, stack: e.stack });
function throwError(message, args) {
    var error = new Error(_.template(message, args || {}, { interpolate: /\#\{(.+?)\}/g }));
    error.name = 'Error';
    throw error;
}

// Sluggify a `text`.
// This function replaces spaces by `-` and remove all non ascii characters.
function sluggify(text) {
    return String(text).toLowerCase().replace(RegExp(" ", "g"), "-").replace(/[^\w-]+/g, "")
}

// Parse boolean from a string or a boolean.
// Leading whitespaces in the string are ignored.
function parseBoolean(string) {
    return /^true$/i.test(string);
}

// Ensure that some property of path `propertyPath` is defined in `object` and not empty.
// If a `value` is provided as third arguments then it also checked that the value
// referred by `propertyPath` is equal to `value`.
function ensure(object, propertyPath /*, value */) {
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

// Check if `object` is missing some (sub)property referenced by `propertyPath`.
function missing(object, propertyPath) {
    return !ensure(object, propertyPath);
}

// Deep version of lodash _.defaults
var defaultsDeep = _.partialRight(_.merge, function recursiveDefaults ( /* ... */ ) {
    // Ensure dates and arrays are not recursively merged
    if (_.isArray(arguments[0]) || _.isDate(arguments[0])) {
        return arguments[0];
    }
    return _.merge(arguments[0], arguments[1], recursiveDefaults);
});

// Trigger an event and/or a corresponding method name (@copyright Marionette.triggerMethod).
// - `this.triggerMethod('foo')` will trigger the 'foo' event and
// call the 'onFoo' method.
// - `this.triggerMethod('foo:bar')` will trigger the 'foo:bar' event and
// call the 'onFooBar' method.
Debugger.triggerMethod = (function () {

    // Split the event name on the ':'
    var splitter = /(^|:)(\w)/gi;

    // Take the event section ('section1:section2:section3')
    // and turn it in to uppercase name
    function getEventName(match, prefix, eventName) {
        return eventName.toUpperCase();
    }

    // Actual triggerMethod implementation
    var triggerMethod = function (event) {
        // get the method name from the event name
        var methodName = 'on' + event.replace(splitter, getEventName);
        var method = this[methodName];
        var result;

        // Call the onMethodName if it exists
        if (_.isFunction(method)) {
            // pass all arguments, except the event name
            result = method.apply(this, _.tail(arguments));
        }

        // Trigger the event, if a trigger method exists
        if (_.isFunction(this.trigger)) {
            this.trigger.apply(this, arguments);
        }

        return result;
    };

    return triggerMethod;
})();

// SmartBuffer
// -----------

// The SmartBuffer can buffer data intelligently using various techniques:
// - standard (default) - behave like a standard queue
// - pairing - pair buffered data two by two
// - shadowing - shadow last element when needed
// - ignoreData - just keep timestamp and ignore data
Debugger.SmartBuffer = (function () {

    // Create a new smart buffer model with the specified options.
    // By default `pairing`, `shadowing` and `ignoreData` are all set to `false`.
    var SmartBuffer = function (options) {
        this._buffer = [];
        this.options = defaultsDeep({}, options, {
            pairing: false,
            shadowing: false,
            ignoreData: false
        });
    };

    // Attach all inheritable methods to the SmartBuffer prototype.
    _.extend(SmartBuffer.prototype, {

        // Concat `bulk` data.
        concat: function (bulk) {
            _.each(bulk, function (f) {
                this.push.apply(this, f);
            }, this);
        },

        // Push new `data` with given `timestamp`.
        push: function (timestamp, data) {
            // In case we just keep track of the timestamp.
            if (this.options.ignoreData) {
                this._buffer.push({
                    timestamp: timestamp
                });
                return;
            }

            // Return if buffer is empty and data is undefined.
            if (_.isEmpty(this._buffer) && _.isUndefined(data)) {
                return;
            }

            if (this.options.pairing) {
                if (data !== undefined && _.isEmpty(this._buffer)) {
                    // If buffer is empty just push the new data.
                    this._buffer.push({
                        timestamp: timestamp,
                        data: data,
                        next: this.options.shadowing? {
                            timestamp: timestamp,
                            data: data
                        } : null
                    });
                } else if (data !== undefined) {
                    // Set previous.next.
                    this._buffer[this.size() - 1].next = {
                        timestamp: timestamp,
                        data: data
                    };
                    // Push a new frame.
                    this._buffer.push({
                        timestamp: timestamp,
                        data: data,
                        next: this.options.shadowing? {
                            timestamp: timestamp,
                            data: data
                        } : null
                    });
                } else if (this.options.shadowing)  {
                    // If shadowing then update shadow timestamp.
                    this._buffer[this.size() - 1].next.timestamp = timestamp;
                }
            } else /* pairing is not activated */ {
                if (data !== undefined && this._lastIsShadow) {
                    // Replace shadow by new frame if shadowing is activated. #
                    this._buffer[this.size() - 1] = {
                        timestamp: timestamp,
                        data: data
                    };
                    // Last is not a shadow anymore.
                    this._lastIsShadow = false;
                } else if (data !== undefined && this._lastIsShadow) {
                    // Update shadow timestamp if shadowing is activated
                    this._buffer[this.size() - 1].timestamp = timestamp;
                } else if (data !== undefined) {
                    // Push new data
                    this._buffer.push({
                        timestamp: timestamp,
                        data: data
                    });
                } else if (this.options.shadowing) {
                    // Push a shadow if shadowing is activated.
                    this._buffer.push({
                        timestamp: timestamp,
                        data: this._buffer[this.size() - 1].data
                    });
                    // Make last a shadow.
                    this._lastIsShadow = true;
                }
            }
        },

        // Get all data from the buffer.
        all: function () {
            return this._buffer;
        },

        // Get first item from the buffer.
        first: function() {
            return _.first(this._buffer);
        },

        // Get last item from the buffer.
        last: function() {
            return _.last(this._buffer);
        },

        // Select and return a subset of items matching some `predicate`.
        select: function (predicate) {
            return _.filter(this._buffer, predicate);
        },

        // Return a subset of items not matching some `predicate`.
        reject: function (predicate) {
            return _.reject(this._buffer, predicate);
        },

        // Return the domain covered by this buffer where date in the domain are formatted according to `dateFn`.
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

        // Return a frame from buffered data that match a given `timestamp`.
        // If no match found then `null` is returned.
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

        // Return a frame inside a timestamp `range`, if multiple frames match then the one
        // closest to the boundary on the `direction` side will be returned.
        // If no match found then `null` is returned.
        inside: function (range, direction) {
            // The lookup function depends on the lookup direction
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

        // Return size of the buffer.
        size: function () {
            return this._buffer.length;
        },

        // Clear the buffer.
        clear: function() {
            // We don't use this._buffer = [] here cause there can be other references
            // to this array in the code.
            while(this._buffer.length > 0) {
                this._buffer.pop();
            }
        },

        // Flush all frames from buffer that date before `timestamp`.
        flushBefore: function (timestamp) {
            _.remove(this._buffer, function(frame) {
                if (this.options.pairing) {
                    return frame.timestamp <= timestamp && frame.next.timestamp < timestamp;
                } else {
                    return frame.timestamp <= timestamp;
                }
            }, this);
        }
    });

    return SmartBuffer;
})();