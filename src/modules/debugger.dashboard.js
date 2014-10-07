/**
 * Dashboard
 */


Debugger.Dashboard = function (selector, options) {
    // check if selector is given
    if (!selector) {
        throwError('You must specify a selector to create a Dashboard.');
    }

    _.bindAll(this, 'onPacketReceived');

    this._groups = {};
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
            group: {
                height: 60
            },
            ruler: {
                width: 30
            }
        });

        this._init_ui(selector);
        this._init_d3();
        this._clean();
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
            this.connector.off('packet:received', this.update);
        }

        // register to *connector* events
        this.connector = connector;
        this.connector.on('packet:received', this.onPacketReceived);

        return this;
    },

    /**
     * Update dashboard with new data. This is generally called by the connected
     * connector when new data are received.
     *
     * @param packet
     */
    onPacketReceived: function(packet) {
        try {
            if (packet.request) {
                var updateFocusLine = false;

                if (packet.eventline) {
                    // reset the dashboard on each request
                    this._reset();

                    // update focusline with received data
                    // note: here we prevent rendering except for the last frame
                    var lastFrame = packet.eventline.pop();

                    _.each(packet.eventline, function (frame) {
                        this._update_focusline_with_frame(frame, {render: false});
                    }, this);

                    if (lastFrame) {
                        this._update_focusline_with_frame(lastFrame);
                    }
                } else {
                    // reset the dashboard on each request
                    // this will not clean the focusline
                    this._clean();
                }

                // set the default group demux
                if (packet.groups) {
                    this._demux = this._create_demux({grouping: packet.groups});
                }

                // update widgets with received data
                var lastFrame = packet.data.pop();

                _.each(packet.data, function (frame) {
                    this._update_all_with_frame(frame, {render: false});
                }, this);

                if (lastFrame) {
                    this._update_all_with_frame(lastFrame);
                }

                // update widgets according to ruler
                //this._notifyWidgetsOfRulerPosition();
            } else {
                // this is a streaming packet
                var data = packet.data;
                if (data instanceof Array) {
                    // update widgets with received data
                    // note: here we prevent rendering except for the last frame
                    var lastFrame = data.pop();

                    _.each(data, function (frame) {
                        this._update_focusline_with_frame(frame, {render: false});
                        this._update_all_with_frame(frame, {render: false});
                    }, this);

                    if (lastFrame) {
                        this._update_focusline_with_frame(lastFrame);
                        this._update_all_with_frame(lastFrame);
                    }
                } else {
                    this._update_focusline_with_frame(data);
                    this._update_all_with_frame(data);
                }

                // update widgets according to ruler
                this._notifyWidgetsOfRulerPosition();
            }
        } catch (e) {
            Debugger.logger.error('Error when processing packet `#{packet}`. #{error} #{stacktrace}', {
                packet: packet,
                error: e,
                stacktrace: e.stack
            });
        }
    },

    /**
     * Request initial history trace.
     *
     * @param params
     */
    requestInitialHistoryTrace: function(params) {
        params = _.defaults({}, params, {
            order: 'type'
        });

        if (this.connector) {
            this.connector.requestInitialHistoryTrace({
                screenResolution: this._focusline.computed('svg.width'),
                selectorResolution: this.options.ruler.width,
                brushResolution: this._focusline.computed('svg.width'),
                order: params.order
            })
        }
    },

    /**
     * Request history trace.
     *
     * @param params
     */
    requestHistoryTrace: function(params) {
        params = _.defaults({}, params, {
            order: 'type',
            brushResolution: this._focusline.computed('svg.width')
        });

        if (this.connector) {
            this.connector.requestHistoryTrace({
                screenResolution: this._focusline.computed('svg.width'),
                selectorResolution: this.options.ruler.width,
                brushResolution: params.brushResolution,
                order: params.order
            })
        }
    },

    /**
     * Request live trace.
     */
    requestLiveTrace: function() {
        if (this.connector) {
            this.connector.requestLiveTrace();
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

        // bind dashboard to its events
        this.listenTo(this._focusline, 'focus:change', this._onFocusChange);
        this.listenTo(this._focusline, 'brush:resize', this._onBrushResize);

        // attach it to the dashboard
        this._attach_widget(this._focusline, this._$footer);
    },

    /**
     * Reset dashboard to its initial state.
     * @private
     */
    _reset: function() {
        // clean groups, devices, programs
        this._clean();

        this._devices = {};  // reset devices
        this._programs = {}; // reset programs

        // reset focusline and domain
        this._focusline.reset();
        this._domain = [_.now(), 0];
    },

    /**
     * Clean dashboard. Cleaning the dashboard will (a) clean and detach all widgets but
     * the focusline and (b) destroy all groups.
     * @private
     */
    _clean: function() {
        // detach devices
        _.forEach(this._devices, function(widget) {
            this._detach_widget(widget);
        }, this);

        // detach programs
        _.forEach(this._programs, function(widget) {
            this._detach_widget(widget);
        }, this);

        // remove groups
        _.forEach(this._groups, function(group) {
            this._remove_group(group);
        }, this);

        // reset groups
        this._groups = {};

        // set default group demultiplexer
        this._demux = this._create_demux({ func: 'type' });
    },

    /**
     * Focus change callback.
     * @private
     */
    _onFocusChange: function() {
        this._notifyWidgetsOnRulerFocusChanged(this._$ruler.position());
    },

    /**
     * Brush resize callback.
     * @param width Width of the resized brush.
     * @private
     */
    _onBrushResize: function(width) {
        this.triggerMethod.apply(this, ['zoom:request'].concat([{
            screenResolution: this._focusline.computed('svg.width'),
            selectorResolution: 10,
            brushResolution: width
        }]));
    },

    /**
     * Widget marker click callback.
     * @param decorations Array of decorations associated to the marker.
     * @private
     */
    _onWidgetMarkerClick: function(decorations) {
        var textContent = '';
        var htmlContent = '';

        // Build basic string representation of `decorations` array
        // both as plain text and HTML.
        _.each(_.sortBy(decorations, function(decoration) { return parseInt(decoration.order) }), function(decoration) {
            textContent += decoration.description + '\n';
            htmlContent += decoration.description + '</br>';
        });

        // Trigger `marker:click` event with following arguments:
        // - decorations: Arrays - list of decorations associated to the marker
        // - textContent: String - concatenations of all decorations to plain text
        // - htmlContent: String - concatenations of all decorations to HTML
        this.triggerMethod.apply(this, ['marker:click'].concat([decorations, textContent, htmlContent]));
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
     * Update focusline.
     *
     * @param frame Data frame to update the focusline with.
     * @param options
     * @private
     */
    _update_focusline_with_frame: function(frame, options) {
        // update domain
        this._domain = [Math.min(this._domain[0], frame.timestamp), Math.max(this._domain[1], frame.timestamp)];

        // update focusline
        this._focusline.update({
            timestamp: frame.timestamp,
            frame: {
                value: frame.value? frame.value : _.size(frame.devices) + _.size(frame.programs)
            }
        }, this._domain, options);
    },

    /**
     * Update all widgets attached to the dashboard according to some `frame` data.
     *
     * @param frame Data frame to update widgets with.
     * @private
     */
    _update_all_with_frame: function (frame, options) {
        // update focus
        this._focus = this._focusline.brush.empty()? this._domain : this._focusline.brush.extent();

        //
        // Devices
        //

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

        //
        // Programs
        //

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

        //
        // Groups
        //
        _.forEach(this._groups, function (group) {
           group.timeline.update({
               timestamp: frame.timestamp
           }, this._focus, options);
        }, this);
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

            // attach the widget to its group if not attached
            if (widget.isDetached()) {
                this._attach_widget_to_group(widget);
            }

            widget.update(frame, this._focus, options);
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
     * Create a group demultiplexer function from given `attributes`.
     *
     * @param attributes
     * @private
     */
    _create_demux: function(attributes) {
        if (attributes && attributes.func) {
            switch (attributes.func) {
                case 'type': return function(item) {
                    return item.type? 'Devices' : 'Programs'
                };
                default: return function(item) {
                    return 'Unknown'
                };
            }
        } else if (attributes && attributes.grouping) {
            return (function() {
                var grouping = attributes.grouping;

                return function(item) {
                    var group = _.find(grouping, function(group) {
                        return _.indexOf(group.members, item.id) !== -1;
                    });

                    if (group) {
                        return group.name;
                    } else {
                        return 'Unknown';
                    }
                };
            })();
        } else {
            return function(item) {
                return 'Unknown';
            };
        }
    },

    /**
     * Create a new group with given `attributes`.
     *
     * @param attributes
     * @private
     */
    _create_group: function(attributes) {
        // widget options
        var options = {
            width: this.options.width,
            height: this.options.group.height,
            margin: this.options.widget.margin,
            placeholder: this.options.widget.placeholder,
            ruler: this.options.ruler
        };

        // create timeline for the group
        var timeline = new Debugger.Widgets.Timeline({
            id: _.uniqueId('timeline'),
            name: attributes.name,
            orientation: 'bottom'
        }, options);

        // bind to focusline
        if (_.isFunction(timeline.onFocusChange)) {
            timeline.listenTo(this._focusline, 'focus:change', timeline.onFocusChange);
        }

        var group = $('<div/>')
            .attr({
                id: _.uniqueId('group'),
                class: 'group'
            })
            .append('<header/>')
            .append('<div class="container"></div>');

        // attach group to the dashboard
        this._$container.append(group);

        // attach timeline to the group
        this._attach_widget(timeline, group.find('header')[0]);

        // return group object
        return {
            $el: group,
            $container: group.find('.container')[0],
            timeline: timeline
        };
    },

    /**
     * Remove a group from the dashboard.
     * @param group
     * @private
     */
    _remove_group: function(group) {
        // detach timeline
        this._detach_widget(group.timeline);

        // remove the group $el
        group.$el.remove();

        // delete group
        delete group.$el;
        delete group.$container;
        delete group.timeline;
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
                    case 'SmartPlug':
                        widget = new Debugger.Widgets.SmartPlug({
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

            // bind to focusline
            if (_.isFunction(widget.onFocusChange)) {
                widget.listenTo(this._focusline, 'focus:change', widget.onFocusChange);
            }

            // bind dashboard to widget events
            this.listenTo(widget, 'marker:click', this._onWidgetMarkerClick);

            // find the group to which it belongs
            var groupName = this._demux(attributes);
            this._attach_widget_to_group(widget);
        } else {
            Debugger.logger.error('Unable to create device of type #{type}', attributes);
        }

        return widget;
    },

    /**
     * Attach a widget to a group within this dashboard.
     * If the group if not created then it creates the group first.
     *
     * @param widget Widget to attach
     * @param group (optional) Name of the group
     * @private
     */
    _attach_widget_to_group: function(widget, group) {
        // if group is not provided then find it from widget attributes
        if (_.isUndefined(group)) {
            group = this._demux(widget.attributes);
        }

        // if group is not created then create it
        if (_.isUndefined(this._groups[group])) {
            this._groups[group] = this._create_group({
                name: group
            });
        }

        // attach it to the group in the DOM
        this._attach_widget(widget, this._groups[group].$container);
    },

    /**
     * Attach a widget to a target element within this dashboard.
     * If multiple elements match the target then the widget is appended to the first found.
     *
     * @param widget
     * @param target
     * @private
     */
    _attach_widget: function (widget, target) {
        if (this.$(widget.el).length > 0) {
            throwError("Widget #{widget} already attached to dashboard.", { widget: widget});
        }

        // attach
        if (target) {
            this.$(target).first().append(widget.$el);
        } else {
            this._$container.append(widget.$el);
        }

        // notify
        this.triggerMethod.apply(widget, ['attached'].concat(this.$el));
    },

    /**
     * Detach a widget from this dashboard.
     * @param widget
     * @private
     */
    _detach_widget: function(widget) {
        var parent = widget.$el.parent();

        // notify
        this.triggerMethod.apply(widget, ['detached'].concat(parent));

        // detach
        widget.$el.remove();
    }
});
