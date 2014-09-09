/**
 * Connector
 */

Debugger.Connector = function (options) {
    // check supports for WebSocket
    if (!WebSocket) {
        throwError('WebSocket is not supported.');
    }

    if (_.isFunction(this.initialize)) {
        this.initialize(options);
    }
};

_.extend(Debugger.Connector.prototype, Backbone.Events, {
    initialize: function (options) {
        var self = this;

        options = options || {};

        // set default options in case some is omitted
        this.options = defaultsDeep(options, {
            address: 'localhost',
            port: 8987,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 5000
        });

        this._connectionAttempted = 0;

        // goooo
        this._initiate_connection();
    },

    _initiate_connection: function () {
        var self = this;

        self._connectionAttempted++;

        // create socket
        this.socket = new WebSocket('ws://' + this.options.address + ':' + this.options.port);

        // bind to events
        _.extend(this.socket, {
            onopen: function (event) {
                Debugger.logger.info('Socket opened on #{address}:#{port}', self.options);
                Debugger.trigger('websocket:open');
            },
            onerror: function (event) {
                Debugger.logger.info('Socket error.');
                Debugger.trigger('websocket:error');
            },
            onclose: function (event) {
                var code = event.code;
                var reason = event.reason;

                if (code != 1000) {
                    Debugger.logger.error('Socket closed unexpectedly #{reason}[code: #{code}]', {
                        code: code,
                        reason: reason ? reason + " " : ""
                    });
                } else {
                    Debugger.logger.info('Socket closed.', {
                        code: code,
                        reason: reason
                    });
                }

                Debugger.trigger('websocket:close');

                if (code != 1000 && self.isPersistent() && self.tryReconnection()) {
                    // notify user
                    Debugger.logger.info("Schedule socket reconnection in #{delay}ms (attempt n°#{attempts})", {
                            attempts: self._connectionAttempted,
                            delay: self.options.reconnectionDelay}
                    );
                    // reschedule connection
                    setTimeout(function () {
                        self._initiate_connection()
                    }, self.options.reconnectionDelay);
                }
            },
            onmessage: function (message) {
                var frame = JSON.parse(message.data);
                self.trigger('frame:received', frame);

                try {

                } catch (e) {
                    throwError('Skip message "#{message}" due to error #{error}', {
                        message: message.data,
                        error: e
                    });
                }
            }
        });
    },

    isPersistent: function () {
        return this.options.reconnection;
    },

    tryReconnection: function () {
        return this.options.reconnection && this._connectionAttempted < this.options.reconnectionAttempts;
    },

    // import the `triggerMethod` to trigger events with corresponding
    // methods if the method exists
    triggerMethod: Debugger.triggerMethod,

    destroy: function () {
        var args = Array.prototype.slice.call(arguments);
        this.triggerMethod.apply(this, ['before:destroy'].concat(args));
        this.triggerMethod.apply(this, ['destroy'].concat(args));

        this.stopListening();
        this.off();
        this.socket.close();
    }
});


