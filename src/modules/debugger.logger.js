// Logger
// ------

var Logger = Debugger.Logger = (function () {

    function format(message, args) {
        return _.template(message, args || {}, { interpolate: /\#\{(.+?)\}/g });
    }

    var LoggerWrapper = function (logger) {
        this.__logger = logger || console;
    };

    _.extend(LoggerWrapper.prototype, _.object(_.map(['log', 'info', 'warn', 'debug', 'error'], function (method) {
        return [method, (function (method) {
            return function () {
                var msg = format.apply(this, arguments);
                if (_.isFunction(this.__logger[method])) {
                    this.__logger[method](msg);
                }
            }
        })(method)];
    })));

    return LoggerWrapper;
})();

// Define default logger.
// The default logger output to the console.
Debugger.logger = new Logger(console);