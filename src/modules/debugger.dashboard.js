/**
 * Dashboard
 */


Debugger.Dashboard = function (selector, options) {
    // check if selector is given
    if (!selector) {
        throwError('You must specify a selector to create a Dashboard.');
    }

    _.bindAll(this, 'update');

    this._devices = {};
    this._programs = {};

    // keep track of time domain, this is required when adding dynamically new
    // devices or programs in order to sync their timescale.
    this._domain = [_.now(), 0];

    if (_.isFunction(this.initialize)) {
        this.initialize(selector, options);
    }
};

_.extend(Debugger.Dashboard.prototype, Backbone.Events, {
    initialize: function (selector, options) {
        var self = this;

        // set default options in case some is omitted
        this.options = defaultsDeep({}, options, {
            width: 960,
            widget: {
                height: 50,
                margin: {
                    top: 10,
                    left: 0,
                    bottom: 10,
                    right: 0
                },
                placeholder: {
                    sidebar: {
                        width: 200
                    }
                }
            },
            ruler: {
                width: 30
            }
        });

        this._init_ui(selector);
        this._init_d3();
    },

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function (selector) {
        return this.$el.find(selector);
    },

    // import the `triggerMethod` to trigger events with corresponding
    // methods if the method exists
    triggerMethod: Debugger.triggerMethod,

    /**
     * Connect the dashboard to a `connector`.
     *
     * @param connector Connector to connect this dashboard with.
     * @returns {Debugger.Dashboard}
     */
    connect: function (connector) {
        if (this.connector) {
            // unregister if already registered.
            Debugger.logger.warn("Dashboad connection reinitialized: the dashboad was already connected to a connector.");
            this.connector.off('frame:received', this.update);
        }

        // register to *connector* events
        this.connector = connector;
        this.connector.on('frame:received', this.update);

        return this;
    },

    /**
     * Update dashboard with new data. This is generally called by the connected
     * connector when new data are received.
     *
     * @param data
     */
    update: function (data) {
        if (data instanceof Array) {
            var lastFrame = data.pop();
            _.each(data, function (frame) {
                this._update_all_with_frame(frame, {render: false});
            }, this);
            this._update_all_with_frame(lastFrame);
            this._notifyWidgetsOfRulerPosition();
        } else {
            this._update_all_with_frame(data);
        }
    },

    // Private API

    /**
     * Initialize the UI within the container designated by the `selector`.
     *
     * @param selector Selector of the element in which to initialize the UI.
     * @private
     */
    _init_ui: function (selector) {
        var self = this;

        // create the ruler
        this._$ruler = $('<div class="rule"><div class="line"></div></div>')
            .css({
                'width': this.options.ruler.width,
                'margin-left': this.options.widget.placeholder.sidebar.width
            });

        // create the footer
        this._$footer = $('<footer></footer>');

        // create the widgets holder
        this._$container = $('<div class="container"></div>');

        // setup the dashboard
        this.$el = $(selector).css({
            width: parseInt(this.options.width) + "px"
        }).addClass('dashboard').append(this._$ruler, this._$container, this._$footer);

        // make the ruler draggable
        this._$ruler.draggable({
            axis: 'x',
            containment: 'parent',
            start: function(event, ui) {
                this.lastPosition = ui.position;
            },
            drag: function (event, ui) {
                var direction = (this.lastPosition.left > ui.position.left) ? 'left' : 'right';
                self._notifyWidgetsOnRulerFocusChanged(ui.position, direction);
                this.lastPosition = ui.position;
            }
        });
    },

    /**
     * Initialize D3
     *
     * @private
     */
    _init_d3: function () {
        // define main timescale
        this.timescale = d3.time.scale().range([0, this.options.with]);

        // create focusline
        this._focusline = new Debugger.Widgets.Focusline({id: 'default'}, {
            height: 20,
            placeholder: this.options.widget.placeholder
        });

        this._attach_widget(this._focusline, this._$footer);

        // create timelines
        this._timeline = new Debugger.Widgets.Timeline({
            id: 'timeline',
            name: 'Main',
            orientation: 'bottom'
        }, {
            height: 30,
            placeholder: this.options.widget.placeholder
        });

        this._attach_widget(this._timeline, this._$container);
    },

    /**
     * Notify widgets of the position of the ruler.
     *
     * @private
     */
    _notifyWidgetsOfRulerPosition: function() {
        this._notifyWidgetsOnRulerFocusChanged(this._$ruler.position());
    },

    /**
     * Notify widgets that the ruler is at some `position`.
     *
     * @param position Position of the ruler.
     * @param direction Direction of the ruler, can be 'left' or 'right'
     * @private
     */
    _notifyWidgetsOnRulerFocusChanged: function(position, direction) {
        // offset = parent.offset.left - ruler.width/2
        var offset = this.$el.offset().left - this.options.ruler.width / 2;
        // invoke rulerFocusChanged on all devices & programs
        _.invoke(this._devices, 'rulerFocusChanged', position.left - offset, direction || 'left');
        _.invoke(this._programs, 'rulerFocusChanged', position.left - offset, direction || 'left');
    },

    /**
     * Update all widgets attached to the dashboard according to some `frame` data.
     *
     * @param frame Data frame to update widgets with.
     * @private
     */
    _update_all_with_frame: function (frame, options) {
        // update domain
        this._domain = [Math.min(this._domain[0], frame.timestamp), Math.max(this._domain[1], frame.timestamp)];

        // update focusline
        this._focusline.update({
            timestamp: frame.timestamp,
            frame: {
                value: _.size(frame.devices) + _.size(frame.programs)
            }
        }, this._domain, options);

        var updated_device_ids = [];

        // update devices listed in frame
        _.forEach(frame.devices, function (update) {
            // create device if it does not exit yet
            if (!this._has_widget('device', update.id)) {
                this._create_widget('device', update);
            }

            // update it
            this._update_one_with_frame('device', update.id, {
                timestamp: frame.timestamp,
                frame: update
            }, options);

            // mark as updated
            updated_device_ids.push(update.id);
        }, this);

        // update all other devices (timestamp only)
        _.forEach(this._devices, function (device, device_id) {
            if (!_.contains(updated_device_ids, device_id)) {
                this._update_one_with_frame('device', device_id, {timestamp: frame.timestamp}, options);
            }
        }, this);

        var updated_program_ids = [];

        // update devices listed in frame
        _.forEach(frame.programs, function (update) {
            // create program if it does not exit yet
            if (!this._has_widget('program', update.id)) {
                this._create_widget('program', update);
            }

            // update it
            this._update_one_with_frame('program', update.id, {
                timestamp: frame.timestamp,
                frame: update
            }, options);

            // mark as updated
            updated_program_ids.push(update.id);
        }, this);

        // update all other programs (timestamp only)
        _.forEach(this._programs, function (program, program_id) {
            if (!_.contains(updated_program_ids, program_id)) {
                this._update_one_with_frame('program', program_id, {timestamp: frame.timestamp}, options);
            }
        }, this);

        // update timeline
        this._timeline.update({
            timestamp: frame.timestamp
        }, this._domain, options);
    },

    /**
     * Update a `what` widget if id `id` according to some `frame` data.
     *
     * @param what Kind of widget to update (e.g. 'program', 'device')
     * @param id Id of the widget to update
     * @param frame Data frame to update the widget with.
     * @private
     */
    _update_one_with_frame: function (what, id, frame, options) {
        if (this._has_widget(what, id)) {
            var widget = what === 'device' ? this._devices[id] : this._programs[id];
            widget.update(frame, this._domain, options);
        }
    },

    /**
     * Check whether a `what` widget with id `id` exists.
     *
     * @param what Kind of widget to check (e.g. 'program', 'device')
     * @param id Id of the widget to check
     * @returns {boolean} true if it exists, false otherwise.
     * @private
     */
    _has_widget: function (what, id) {
        switch (what) {
            case 'device':
                return _.has(this._devices, id);
            case 'program':
                return _.has(this._programs, id);
            default:
                false;
        }
    },

    /**
     * Create a new `what` widget with given `attributes`.
     *
     * @param what Kind of widget to check (e.g. 'program', 'device')
     * @param attributes
     * @returns {object} The widget created.
     * @private
     */
    _create_widget: function (what, attributes) {
        var widget = undefined;

        // widget options
        var options = {
            width: this.options.width,
            height: this.options.widget.height,
            margin: this.options.widget.margin,
            placeholder: this.options.widget.placeholder,
            ruler: this.options.ruler
        };

        switch (what) {
            case 'program':
                widget = new Debugger.Widgets.Program({id: attributes.id}, options);
                break;
            case 'device':
                switch (attributes.type) {
                    case 'Temperature':
                        widget = new Debugger.Widgets.Temperature({
                            id: attributes.id,
                            type: attributes.type
                        }, options);
                        break;
                    case 'Switch':
                        widget = new Debugger.Widgets.Switch({
                                id: attributes.id,
                                type: attributes.type
                            }, options);
                        break;
                    case 'Contact':
                        widget = new Debugger.Widgets.Contact({
                                id: attributes.id,
                                type: attributes.type
                            }, options);
                        break;
                    case 'KeyCardSwitch':
                        widget = new Debugger.Widgets.KeycardSwitch({
                                id: attributes.id,
                                type: attributes.type
                            }, options);
                        break;
                    case 'ColorLight':
                        widget = new Debugger.Widgets.ColorLight({
                                id: attributes.id,
                                type: attributes.type
                            }, options);
                        break;
                }
                break;
        }

        if (widget) {
            // keep track of new created widget
            switch (what) {
                case 'device':
                    this._devices[attributes.id] = widget;
                    break;
                case 'program':
                    this._programs[attributes.id] = widget;
                    break;
            }
            // attach it to the DOM
            this._attach_widget(widget);
        } else {
            //throwError('Unable to create device of type #{type}', attributes);
        }

        return widget;
    },

    /**
     * Attach a widget to a target element within this dashboard.
     * If multiple elements match the target then the widget is append to the first found.
     *
     * @param widget
     * @param target
     * @private
     */
    _attach_widget: function (widget, target) {
        if (this.$(widget.el).length > 0) {
            throwError("Widget #{widget} already attached to dashboard.", { widget: widget});
        }

        if (target) {
            this.$(target).first().append(widget.$el);
        } else {
            this._$container.append(widget.$el);
        }

        // notify
        this.triggerMethod.apply(widget, ['attached'].concat(this.$el));
    }
});
