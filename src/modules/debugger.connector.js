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

        // keep track of connection attempt
        this._connectionAttempted = 0;

        // keep pending requests
        this._requestsQueue = [];

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
                self._execLastPendingRequestAndDropOthers();
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
                try {
                    var unpacked = self._unpackMessage(message.data);
                    self.trigger('packet:received', unpacked);
                } catch (e) {
                    throwError('Skip message "#{message}" due to error #{error}', {
                        message: message,
                        error: e
                    });
                }
            }
        });
    },

    /**
     * Request livetrace from the AppsGate server.
     */
    requestLiveTrace: function() {
        return this._exec({
            name: 'livetrace'
        });
    },

    /**
     * Request historytrace from the AppsGate server.
     *
     * @param params
     * @returns {*}
     */
    requestHistoryTrace: function(params) {
        var now = Date.now();

        // set default params
        params = _.defaults({}, params, {
            from: now - 24*3600*1000,
            to: now,
            withEventLine: false,
            screenResolution: 930,
            selectorResolution: 10,
            brushResolution: 930,
            order: 'type'
        });

        // execute request
        return this._exec({
            name: 'historytrace',
            args: params
        });
    },

    /**
     * Request initial history trace.
     *
     * The initial history trace is an history trace along with
     * its associated event line.
     *
     * @param params
     * @returns {*}
     */
    requestInitialHistoryTrace: function(params) {
        return this.requestHistoryTrace(defaultsDeep({withEventLine: true}, params));
    },

    /**
     * Exec last pending request and drop the others
     * .
     * @private
     */
    _execLastPendingRequestAndDropOthers: function() {
        if (!_.isEmpty(this._requestsQueue)) {
            var last = _.last(this._requestsQueue);
            _.forEach(this._requestsQueue, function(request) {
                Debugger.logger.info("Dropping old request #{request} from pending queue", {
                    request: JSON.stringify(request)
                });
            });
            this._clearRequestsQueue();
            this._exec(last);
        }
    },

    /**
     * Execute a `request`. In case the socket is not OPEN the request will
     * be appended to the requestsQueue to be executed later.
     *
     * @param request
     * @private
     */
    _exec: function(request) {
        if (this.socket.readyState == WebSocket.OPEN) {
            Debugger.logger.info("Executing request #{request}", {
                request: JSON.stringify(request)
            });
            this.socket.send(JSON.stringify(request));
            return true;
        } else {
            Debugger.logger.info("Postpone request #{request}", {
                request: JSON.stringify(request)
            });
            this._requestsQueue.push(request);
            return false;
        }
    },

    /**
     * Clear all pending requests.
     *
     * @private
     */
    _clearRequestsQueue: function() {
        this._requestsQueue = [];
    },

    /**
     * Unpack message into a {request, data, groups} object. Depending on the received
     * message value in the return object might be null.
     *
     * @param message Message to unpack
     * @returns {*} triple {request, data, groups}.
     * @private
     */
    _unpackMessage: function(message) {
        var answer = JSON.parse(message);
        if (_.isObject(answer) && _.has(answer, 'request')) {
            return {
                request: answer.request,
                data: answer.result.data,
                eventline: answer.result.eventline,
                groups: answer.result.groups
            };
        } else {
            return {
                request: null,
                data: answer,
                eventline: null,
                groups: null
            };
        }
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


