// Dashboard
// ---------

// AppsGate **Dashboard** is the central element of the AppsGate Debugger.

// Create a new Dashboard with the specified `options` and append it to the given `selector`.
Debugger.Dashboard = function (selector, options) {
    // check if selector is given
    if (!selector) {
        throwError('You must specify a selector to create a Dashboard.');
    }

    _.bindAll(this, 'onPacketReceived');

    this._groups = {};
    this._devices = {};
    this._programs = {};

    // Extract d3 settings from options
    if (options) {
        this._d3_settings = options.d3; delete options.d3;
    }

    // keep track of time domain, this is required when adding dynamically new
    // devices or programs in order to sync their timescale.
    this._domain = [_.now(), 0];

    if (_.isFunction(this.initialize)) {
        this.initialize(selector, options);
    }
};

// Attach all inheritable methods to the Dashboard prototype.
_.extend(Debugger.Dashboard.prototype, Backbone.Events, {

    // Initialize the dashboard.
    initialize: function (selector, options) {
        this.options = defaultsDeep(options || {}, {
            theme: THEMES_BASIC,
            i18n: {
                ns: 'debugger'
            },
            selector: {
                resolution: 30
            }
        });

        this._init_ui(selector);
        this._init_konami();
        this._init_d3();
        this._clean();
    },

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function (selector) {
        return this.$el.find(selector);
    },

    // Import the `triggerMethod` to trigger events with corresponding
    // methods if the method exists
    triggerMethod: Debugger.triggerMethod,

    //Connect the dashboard to a `connector`.
    connect: function (connector) {
        if (this.connector) {
            // Unregister if already registered.
            Debugger.logger.warn("Dashboad connection reinitialized: the dashboad was already connected to a connector.");
            this.connector.off('packet:received', this.update);
        }

        // Register to `connector` events
        this.connector = connector;
        this.connector.on('packet:received', this.onPacketReceived);

        return this;
    },

    // Update dashboard with new data. This is generally called by the connected
    // connector when new data are received.
    onPacketReceived: function(packet) {
        try {
            if (packet.request) {
                var updateFocusLine = false;

                if (packet.eventline) {
                    // Reset the dashboard on each request.
                    this._reset();

                    // Update focusline with received data.
                    // note: here we prevent rendering except for the last frame
                    var lastFrame = packet.eventline.pop();

                    _.each(packet.eventline, function (frame) {
                        this._update_focusline_with_frame(frame, {render: false});
                    }, this);

                    if (lastFrame) {
                        this._update_focusline_with_frame(lastFrame);
                    }
                } else {
                    // Reset the dashboard on each request
                    // this will not clean the focusline.
                    this._clean();
                }

                // Set the default group demux.
                if (packet.groups) {
                    this._demux = this._create_demux({grouping: packet.groups});
                }

                // Update widgets with received data.
                var lastFrame = packet.data.pop();

                _.each(packet.data, function (frame) {
                    this._update_all_with_frame(frame, {render: false});
                }, this);

                if (lastFrame) {
                    this._update_all_with_frame(lastFrame);
                }

                // @todo document
                if (lastFrame.timestamp < this._focus[1]) {
                    this._update_focusline_with_frame({timestamp: this._focus[1]});
                    this._update_all_with_frame({timestamp: this._focus[1]});
                }

                // Unset loading mode
                this._toggleLoading(false);

                // Update widgets according to ruler
                this._notifyWidgetsOfRulerPosition();
            } else {
                // Unset loading mode
                this._toggleLoading(false);

                // This is a streaming packet
                var data = packet.data;
                if (data instanceof Array) {
                    // Update widgets with received data.
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

                    // @todo document
                    if (lastFrame.timestamp < this._focus[1]) {
                        this._update_focusline_with_frame({timestamp: this._focus[1]});
                        this._update_all_with_frame({timestamp: this._focus[1]});
                    }
                } else {
                    this._update_focusline_with_frame(data);
                    this._update_all_with_frame(data);
                }

                // Update widgets according to ruler.
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

    // Request initial history trace.
    requestInitialHistoryTrace: function(params) {
        params = _.defaults({}, params, {
            order: 'type',
            screenResolution: this._focusline.computed('svg.width'),
            selectorResolution: this.options.selector.resolution,
            brushResolution: this._focusline.computed('svg.width')
        });

        if (this.connector) {
            this.connector.requestInitialHistoryTrace(params);
        }
    },

    // Request history trace.
    requestHistoryTrace: function(params) {
        params = _.defaults({}, params, {
            order: 'type',
            brushResolution: this._focusline.computed('svg.width')
        });

        if (this.connector) {
            this.connector.requestHistoryTrace({
                screenResolution: this._focusline.computed('svg.width'),
                selectorResolution: this.options.selector.resolution,
                brushResolution: params.brushResolution,
                order: params.order
            })
        }
    },

    //  Request live trace.
    requestLiveTrace: function() {
        if (this.connector) {
            this.connector.requestLiveTrace();
        }
    },

    // **Private API**

    _init_konami: function() {
        var self = this;
        self._konami = "38,38,40,40,37,39,37,39,66,65";
        self._konami_slice = self._konami.split(',').length;
        self._kkeys = [];
        window.addEventListener("keydown", function(e){
            self._kkeys.push( e.keyCode );
            if ( self._kkeys.toString().indexOf( self._konami ) >= 0 ) {
                $('body').addClass('konami-background');
            }
            self._kkeys = self._kkeys.slice(-self._konami_slice);
        }, true);
    },

    // Initialize the UI within the container designated by the `selector`.
    _init_ui: function (selector) {
        var self = this;

        // Create header and footer.
        this._$header = $('<header></header>').css({
            width: parseInt(this.options.theme.dashboard.width) + "px"
        });
        this._$footer = $('<footer></footer>').css({
            width: parseInt(this.options.theme.dashboard.width) + "px"
        });

        // Create the widgets group container
        this._$group_container = $('<div class="group-container"></div>').css({
            width: parseInt(this.options.theme.dashboard.width) + "px"
        });

        // Create dashboard content container
        this._$container = $('<div class="dashboard-container"></div>').append(this._$group_container);

        // Create loading bar
        this._$loader = $('<div class="dashboard-loader"><div class="icon-loading"></div> </div>').css({
            width: parseInt(this.options.theme.dashboard.width) + "px"
        });

        // Setup the dashboard.
        this.$el = $(selector).addClass('dashboard').append(
            this._$header,
            this._$container,
            this._$loader,
            this._$footer);

        // Create ruler and hide it
        this._create_dashboard_ruler();

        // Put dashboard in loading mode
        this._toggleLoading(true);
    },

    // Initialize D3
    _init_d3: function () {
        // Define main timescale.
        this.timescale = d3.time.scale().range([0, this.options.theme.dashboard.width]);

        // Setup local and override d3 time format.
        if (this._d3_settings && this._d3_settings.locale) {
            this._d3_locale = d3.locale(this._d3_settings.locale);
            d3.time.format = this._d3_locale.timeFormat;
        }

        if (this._d3_settings && this._d3_settings.timeFormatMulti) {
            this._d3_timeFormatMulti = d3.time.format.multi(this._d3_settings.timeFormatMulti);
        }

        // Setup focusline specific options.
        var focusline_options = defaultsDeep({
                theme: {
                    dashboard: {
                        widget: {
                            height: this.options.theme.focusline.height,
                            margin: this.options.theme.focusline.margin
                        },
                        sidebar: {
                            width: 0
                        },
                        aside: {
                            width: 0
                        }
                    }
                },
                extra: {
                    svg: {
                        innerMargin: {
                            left: this.options.theme.focusline.selector.handle.width,
                            right: this.options.theme.focusline.selector.handle.width
                        }
                    }
                }
            },
            {
                theme: this.options.theme
            });

        // Setup focusline attributes
        var focusline_attributes = {
            id: 'default',
            orientation: 'bottom',
            timeFormat: this._d3_timeFormatMulti
        };

        // Create focusline.
        this._focusline = new Debugger.Widgets.Focusline(focusline_attributes, focusline_options);

        // Bind dashboard to its events.
        this.listenTo(this._focusline, 'focus:change', this._onFocusChange);
        this.listenTo(this._focusline, 'brush:resize', this._onBrushResize);

        // Attach it to the dashboard.
        this._attach_widget(this._focusline, this._$header);
    },

    _toggleLoading: function(visible) {
        if (visible) {
            this._$header.hide();
            this._$group_container.hide();
            this._$loader.show();
            this._$footer.hide();
        } else {
            this._$header.show();
            this._$group_container.show();
            this._$loader.hide();
            this._$footer.show();
        }
    },

    // Reset dashboard to its initial state.
    _reset: function() {
        // Clean groups, devices, programs.
        this._clean();

        this._devices = {};  // reset devices
        this._programs = {}; // reset programs

        // Reset focusline and domain.
        this._focusline.reset();
        this._domain = [_.now(), 0];
    },

    // Clean dashboard. Cleaning the dashboard will (a) clean and detach all widgets but
    // the focusline and (b) destroy all groups.
    _clean: function() {
        // Put dashboard in loading mode
        this._toggleLoading(true);

        // Detach devices.
        _.forEach(this._devices, function(widget) {
            this._detach_widget(widget);
        }, this);

        // Detach programs.
        _.forEach(this._programs, function(widget) {
            this._detach_widget(widget);
        }, this);

        // Remove groups.
        _.forEach(this._groups, function(group) {
            this._remove_group(group);
        }, this);

        // Reset groups.
        this._groups = {};

        // Set default group demultiplexer (demux).
        this._demux = this._create_demux({ func: 'type' });
    },

    // Focus change callback.
    _onFocusChange: function() {
        this._notifyWidgetsOnRulerFocusChanged(this._$ruler.position());
    },

    // Brush resize callback.
    _onBrushResize: function(width) {
        this.triggerMethod.apply(this, ['zoom:request'].concat([{
            screenResolution: this._focusline.computed('svg.width'),
            selectorResolution: this.options.selector.resolution,
            brushResolution: width
        }]));
    },

    // Widget marker click callback.
    // `decorations` is an array of decorations associated to the marker.
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

    // Notify widgets of the position of the ruler.
    _notifyWidgetsOfRulerPosition: function() {
        this._notifyWidgetsOnRulerFocusChanged(this._$ruler.position());
    },

    // Notify widgets that the ruler is at some `position` and dragged into some `direction`.
    // Direction can be 'left' or 'right'.
    _notifyWidgetsOnRulerFocusChanged: function(position, direction) {
        var offset = this.options.theme.ruler.width / 2;
        var coordinate = Math.max(Math.min((position.left + offset) / ( this._$ruler.parent().width() - this.options.theme.dashboard.sidebar.width), 1), 0);

        _.invoke([this._focusline], 'rulerFocusChanged', coordinate, direction || 'left');
        _.invoke(this._devices, 'rulerFocusChanged', coordinate, direction || 'left');
        _.invoke(this._programs, 'rulerFocusChanged', coordinate, direction || 'left');
        _.invoke(_.pluck(this._groups, 'timeline'), 'rulerFocusChanged', coordinate, direction || 'left');
    },

    // Update focusline.
    _update_focusline_with_frame: function(frame, options) {
        // Update domain.
        this._domain = [Math.min(this._domain[0], frame.timestamp), Math.max(this._domain[1], frame.timestamp)];

        // Update focusline.
        this._focusline.update({
            timestamp: frame.timestamp,
            frame: {
                value: frame.value? frame.value : _.size(frame.devices) + _.size(frame.programs)
            }
        }, this._domain, options);
    },

    // Update all widgets attached to the dashboard according to some `frame` data.
    _update_all_with_frame: function (frame, options) {
        // Update focus
        this._focus = this._focusline.brush.empty()? this._domain : this._focusline.brush.extent();

        //
        // Update *Devices*.
        //

        var updated_device_ids = [];

        // update devices listed in frame
        _.forEach(frame.devices, function (update) {
            // Create device if it does not exit yet.
            if (!this._has_widget('device', update.id)) {
                this._create_widget('device', update);
            }

            // Update it.
            this._update_one_with_frame('device', update.id, {
                timestamp: frame.timestamp,
                frame: update
            }, options);

            // Mark as updated.
            updated_device_ids.push(update.id);
        }, this);

        // Update all other devices (timestamp only).
        _.forEach(this._devices, function (device, device_id) {
            if (!_.contains(updated_device_ids, device_id)) {
                this._update_one_with_frame('device', device_id, {timestamp: frame.timestamp}, options);
            }
        }, this);

        //
        // Update *Programs*.
        //

        var updated_program_ids = [];

        // Update devices listed in frame.
        _.forEach(frame.programs, function (update) {
            // Create program if it does not exit yet.
            if (!this._has_widget('program', update.id)) {
                this._create_widget('program', update);
            }

            // Update it.
            this._update_one_with_frame('program', update.id, {
                timestamp: frame.timestamp,
                frame: update
            }, options);

            // Mark as updated.
            updated_program_ids.push(update.id);
        }, this);

        // Update all other programs (timestamp only).
        _.forEach(this._programs, function (program, program_id) {
            if (!_.contains(updated_program_ids, program_id)) {
                this._update_one_with_frame('program', program_id, {timestamp: frame.timestamp}, options);
            }
        }, this);

        //
        // Update *Groups*/
        //
        _.forEach(this._groups, function (group) {
           group.timeline.update({
               timestamp: frame.timestamp
           }, this._focus, options);
        }, this);
    },

    // Update a `what` (e.g. 'program', 'device') widget with id `id` according to some `frame` data.
    _update_one_with_frame: function (what, id, frame, options) {
        if (this._has_widget(what, id)) {
            var widget = what === 'device' ? this._devices[id] : this._programs[id];

            // Attach the widget to its group if not attached
            if (widget.isDetached()) {
                this._attach_widget_to_group(widget);
            }

            widget.update(frame, this._focus, options);
        }
    },

    // Check whether a `what` widget with id `id` exists.
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

    // Create a group demultiplexer function from given `attributes`.
    _create_demux: function(attributes) {
        if (attributes && attributes.func) {
            switch (attributes.func) {
                case 'type': return function(item) {
                    return item.type? {name: 'Devices', order: 2} : {name: 'Programs', order: 4}
                };
                default: return function(item) {
                    return { name: 'Unknown', order: 3 }
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
                        return { name: group.name, order: group.order || 3};
                    } else {
                        return { name: 'Unknown', order: 3};
                    }
                };
            })();
        } else {
            return function(item) {
                return 'Unknown';
            };
        }
    },

    // Create the dashboard ruler.
    _create_dashboard_ruler: function() {
        var self = this;

        // Create the ruler.
        this._$ruler = $('<div class="rule"><div class="marker top"></div><div class="line"></div><div class="marker bottom"></div></div>')
            .css({
                'width': this.options.theme.ruler.width,
                'margin-left': this.options.theme.dashboard.sidebar.width,
                'left': this._$group_container.width() - this.options.theme.dashboard.sidebar.width -  this.options.theme.ruler.width / 2
            });

        // Attach it to the dashboard
        this._$group_container.append(this._$ruler);

        // Make the ruler draggable.
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

    // Remove the dashboard ruler.
    _remove_dashboard_ruler: function() {
        // Remove ruler
        this._$ruler.remove();

        // Delete ruler.
        delete this._$ruler;
    },

    // Create a new group with given `attributes`.
    _create_group: function(attributes) {
        // Setup timeline options.
        var timeline_options = {
            theme: this.options.theme
        };

        // Setup timeline attributes
        var timeline_attributes = {
            id: _.uniqueId('timeline'),
            name: i18n.t(attributes.name, {ns: this.options.i18n.ns}),
            orientation: 'top',
            timeFormat: this._d3_timeFormatMulti
        };

        // Create timeline for the group.
        var timeline = new Debugger.Widgets.Timeline(timeline_attributes, timeline_options);

        // Bind to focusline.
        if (_.isFunction(timeline.onFocusChange)) {
            timeline.listenTo(this._focusline, 'focus:change', timeline.onFocusChange);
        }

        var group = $('<div/>')
            .attr({
                id: _.uniqueId('group'),
                class: 'group',
                'data-name': attributes.name,
                'data-order': attributes.order
            })
            .append('<header/>')
            .append('<div class="element-container"></div>');

        // Attach group to the dashboard.
        this._$group_container.append(group);

        // Sort group by order then by name
        this._$group_container.children().tsort(
            {attr: 'data-order'},
            {attr: 'data-name'}
        );

        // Attach timeline to the group.
        this._attach_widget(timeline, group.find('header')[0]);

        // Return group object.
        return {
            $el: group,
            $container: group.find('.element-container')[0],
            timeline: timeline
        };
    },

    // Remove a group from the dashboard.
    _remove_group: function(group) {
        // Detach timeline.
        this._detach_widget(group.timeline);

        // Remove the group $el.
        group.$el.remove();

        // Delete group.
        delete group.$el;
        delete group.$container;
        delete group.timeline;
    },

    // Create a new `what` widget with given `attributes`.
    _create_widget: function (what, attributes) {
        var widget = undefined;

        // Define widget options.
        var options = {
            theme: this.options.theme
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
                    case 'Illumination':
                        widget = new Debugger.Widgets.Illumination({
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
            // Keep track of new created widget.
            switch (what) {
                case 'device':
                    this._devices[attributes.id] = widget;
                    break;
                case 'program':
                    this._programs[attributes.id] = widget;
                    break;
            }

            // Bind to focusline.
            if (_.isFunction(widget.onFocusChange)) {
                widget.listenTo(this._focusline, 'focus:change', widget.onFocusChange);
            }

            // Bind dashboard to widget events.
            this.listenTo(widget, 'marker:click', this._onWidgetMarkerClick);

            // Find and attach it to the group to which it belongs.
            this._attach_widget_to_group(widget);
        } else {
            Debugger.logger.error('Unable to create device of type #{type}', attributes);
        }

        return widget;
    },

    // Attach a widget to a group within this dashboard.
    // If the group if not created then it creates the group first.
    _attach_widget_to_group: function(widget) {
        var group = this._demux(widget.attributes);

        // If group is not created then create it.
        if (_.isUndefined(this._groups[group.name])) {
            this._groups[group.name] = this._create_group({
                name: group.name,
                order: group.order
            });
        }

        // Attach it to the group in the DOM.
        this._attach_widget(widget, this._groups[group.name].$container);
    },

    // Attach a widget to a target element within this dashboard.
    // If multiple elements match the target then the widget is appended to the first found.
    _attach_widget: function (widget, target) {
        if (this.$(widget.el).length > 0) {
            throwError("Widget #{widget} already attached to dashboard.", { widget: widget});
        }

        if (target) {
            this.$(target).first().append(widget.$el);
        } else {
            this._$group_container.append(widget.$el);
        }

        this.triggerMethod.apply(widget, ['attached'].concat(this.$el));
    },

    // Detach a widget from this dashboard.
    _detach_widget: function(widget) {
        var parent = widget.$el.parent();

        this.triggerMethod.apply(widget, ['detached'].concat(parent));

        widget.$el.remove();
    }
});
