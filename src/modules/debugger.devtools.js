/**
 * Developer Tools
 */

Debugger.Monitor = function (options) {
    _.bindAll(this, 'update');

    if (_.isFunction(this.initialize)) {
        this.initialize(options);
    }
};

_.extend(Debugger.Monitor.prototype, Backbone.Events, {
    initialize: function (options) {
        var self = this;

        options || (options = {});

        // set default options in case some is omitted
        this.options = defaultsDeep(options, {
            id: _.uniqueId('monitor')
        });

        this._init_ui();
    },

    _init_ui: function (selector) {
        this.$el = $('<div/>')
            .attr({
                id: this.options.id
            })
            .addClass('monitor')
            .css({
                position: 'fixed',
                bottom: '0px',
                width: '100%',
                height: '30px',
                zindex: '1000000',
                background: 'white'
            });
        $('body').append(this.$el);

        // setup the monitor
        this._$status = $('<div/>')
            .addClass('status')
            .css({
                float: 'right',
                'padding-right': '10px',
                'line-height': '30px',
                'text-align': 'center'
            });
        this.$el.append(this._$status);
    },

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function (selector) {
        return this.$el.find(selector);
    },

    connect: function (connector) {
        if (this.connector) {
            // unregister if already registered.
            Debugger.logger.warn("Monitor connection reinitialized: the monitor was already connected to a connector.");
            this.connector.off('frame:received', this.update);
        }

        // register to *connector* events
        this.connector = connector;
        this.connector.on('frame:received', this.update);

        return this;
    },

    update: function (frame) {
        this._$status.text(frame.timestamp);
    },

    // import the `triggerMethod` to trigger events with corresponding
    // methods if the method exists
    triggerMethod: Debugger.triggerMethod
});
