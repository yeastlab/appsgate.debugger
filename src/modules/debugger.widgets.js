// Widgets
// -------

// AppsGate **Widgets** are the base elements of the AppsGate Dashboard.

// Define `Debugger.Widgets` namespace.
var Widgets = Debugger.Widgets = {};

// Create a new Widget with the specified attributes.
Widgets.Widget = function (attributes, options) {
    var self = this;

    this.attributes = defaultsDeep(attributes || {}, _.result(this, 'defaults'));

    // Check if an *id* and a *kind* is given
    _.forEach(['id', 'kind'], function (key) {
        _.has(self.attributes, key) || throwError('You must specify some *#{key}* to create a Widget.', { key: key});
    });

    _.bindAll(this);

    this.exprs = {};
    this.buffer = new Debugger.SmartBuffer(this.attributes.buffer);
    this.gid = this.attributes.kind + "-" + sluggify(this.attributes.id);

    if (_.isFunction(this.initialize)) {
        this.initialize(options);
    }
};

Widgets.Widget.extend = Debugger.extend;

// Attach all inheritable methods to the Widget prototype.
_.extend(Widgets.Widget.prototype, Backbone.Events, {

    // Initialize widget with default options.
    initialize: function (options) {
        var self = this;

        // set default options in case some is omitted
        this.options = defaultsDeep({}, options, {
            theme: THEMES_BASIC,
            extra: {
                svg: {
                    innerMargin: {
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    }
                }
            }
        });

        // Compute expressions
        this.compute('svg.width', 'this.options.theme.dashboard.width - this.options.extra.svg.innerMargin.left - this.options.extra.svg.innerMargin.right - this.options.theme.dashboard.sidebar.width - this.options.theme.dashboard.widget.margin.left - this.options.theme.dashboard.widget.margin.right');
        this.compute('svg.height', 'this.options.theme.dashboard.widget.height - this.options.extra.svg.innerMargin.top - this.options.extra.svg.innerMargin.bottom - this.options.theme.dashboard.widget.margin.top - this.options.theme.dashboard.widget.margin.bottom');
        this.compute('widget.height', 'this.options.theme.dashboard.widget.height - this.options.theme.dashboard.widget.margin.top - this.options.theme.dashboard.widget.margin.bottom');

        this._initUI();
    },

    // Internal handler triggered when a widget is attached `to` a dashboard.
    onAttached: function (to) {
        // Set ourselves as attached.
        this.isAttached = true;

        // Initialize D3.
        this._initD3(to);
    },

    // Handle `before:init:UI` event.
    onBeforeInitUI: function() { /* default implementation: do nothing */ },

    // Internal method to initialize the user interface.
    _initUI: function () {
        var args = Array.prototype.slice.call(arguments);

        // Notify that we are going to initialize UI.
        this.triggerMethod.apply(this, ['before:init:UI'].concat(args));

        // Create main element
        this.$el = $('<div/>')
            .attr({
                id: this.gid
            })
            .addClass('element')
            .css({
                'margin-top': this.options.theme.dashboard.widget.margin.top,
                'margin-left': this.options.theme.dashboard.widget.margin.left,
                'margin-bottom': this.options.theme.dashboard.widget.margin.bottom,
                'margin-right': this.options.theme.dashboard.widget.margin.right
            })
            .append('<div class="placeholder sidebar"></div>')
            .append('<div class="placeholder d3"></div>')
            .append('<div class="placeholder aside"></div>');
        this.el = this.$el[0];

        // Create `sidebar` placeholder located at the left of d3 placeholder.
        this._$sidebar = this.$('.placeholder.sidebar').css({
            'width': this.options.theme.dashboard.sidebar.width,
            'height': this.computed('svg.height') + this.options.extra.svg.innerMargin.top + this.options.extra.svg.innerMargin.bottom
        });
        this._$sidemenu = $('<div/>').addClass('menu');
        this._$name = $('<div/>').addClass('title').css({
            'line-height': this.computed('svg.height') + this.options.extra.svg.innerMargin.top + this.options.extra.svg.innerMargin.bottom + 'px'
        });
        this._$sidebar.append(this._$sidemenu, this._$name);

        // Create `D3` placeholder (where we draw).
        this._$d3 = this.$('.placeholder.d3').css({
            'width': this.computed('svg.width') + this.options.extra.svg.innerMargin.left + this.options.extra.svg.innerMargin.right,
            'height': this.computed('widget.height')
        }).append(BASE_SVG);

        // Create `aside` placeholder located/floating around the ruler.
        this._$aside = this.$('.placeholder.aside').css({
            'height': this.computed('widget.height'),
            'visibility': 'hidden'
        });

        // Notify that we are initializing UI.
        this.triggerMethod.apply(this, ['init:UI'].concat(args));
    },

    // Handle `init:UI` event.
    onInitUI: function() { /* default implementation: do nothing */ },

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function (selector) {
        return this.$el.find(selector);
    },

    // Handle `before:init:D3` event.
    onBeforeInitD3: function() { /* default implementation: do nothing */ },

    // Internal method to initialize D3.
    _initD3: function(to) {
        var self = this;
        var args = Array.prototype.slice.call(arguments);

        // Notify that we are going to initialized d3
        this.triggerMethod.apply(this, ['before:init:d3'].concat(args));

        // Initialize D3 SVG object.
        this.svg = d3.select(this._$d3[0]).select("svg").attr({
            'width': this.computed('svg.width')  + this.options.extra.svg.innerMargin.left + this.options.extra.svg.innerMargin.right,
            'height': this.computed('widget.height')
        }).append("g")
            .attr('transform', 'translate('+ this.options.extra.svg.innerMargin.left + ', '+ this.options.extra.svg.innerMargin.top +')');

        // Setup D3 functions.
        this.dateFn = function (timestamp) {
            return new Date(timestamp)
        };

        // Setup D3 timescale.
        this.timescale = d3.time.scale()
            .range([0, this.computed('svg.width')])
            .clamp(true);

        // Notify that we are initializing d3
        this.triggerMethod.apply(this, ['init:d3'].concat(args));
    },

    // Handle `init:D3` event.
    onInitD3: function() { /* default implementation: do nothing */ },

    // Check if the widget is currently attached to a dashboard.
    isDetached: function() {
        return !this.isAttached;
    },

    // Internal handler triggered when a widget is detached `from` a dashboard.
    onDetached: function (from) {
        var args = Array.prototype.slice.call(arguments);

        // Set ourselves as detached.
        this.isAttached = false;

        this._destroyD3();
    },

    // Handle `before:destroy:D3` event.
    onBeforeDestroyD3: function() { /* default implementation: do nothing */ },

    // Internal handler triggered when a widget is destroyed.
    _destroyD3: function() {
        var args = Array.prototype.slice.call(arguments);

        // Notify that we are going to destroy d3.
        this.triggerMethod.apply(this, ['before:destroy:d3'].concat(args));

        // Cleanup SVG.
        this.svg.remove();
        delete this.svg;

        // Cleanup buffer.
        this.buffer.clear();

        // Notify that we are destroying d3.
        this.triggerMethod.apply(this, ['destroy:d3'].concat(args));
    },

    // Handle `destroy:D3` event.
    onDestroyD3: function() { /* default implementation: do nothing */ },

    // Handle `before:reset:D3` event.
    onBeforeResetD3: function() { /* default implementation: do nothing */ },

    // Reset the widget
    reset: function() {
        var args = Array.prototype.slice.call(arguments);

        // Notify that we are going to reset d3.
        this.triggerMethod.apply(this, ['before:reset:d3'].concat(args));

        this._destroyD3();
        this._initD3();

        // Notify that we are resetting d3.
        this.triggerMethod.apply(this, ['reset:d3'].concat(args));
    },

    // Handle `reset:D3` event.
    onResetD3: function() { /* default implementation: do nothing */ },

    // Return the value of a computed property.
    computed: function (property) {
        return this.exprs[property].value;
    },

    // Compute the value of a `property' given some `expression`.
    // @warning the value is not automatically recomputed.
    compute: function (property, expression) {
        this.exprs[property] = {
            expression: expression,
            value: eval(expression)
        };

        return this.exprs[property].value;
    },

    // Handle `before:frame:update` event.
    onBeforeFrameUpdate: function() { /* default implementation: do nothing */ },

    // Internal method to update the widget with new data.
    update: function (data, focus, options) {
        // Set default options.
        options = _.defaults({}, options, {
            render: true
        });

        // Build up args for callback.
        var args = Array.prototype.slice.call([data, focus, options]);

        // Notify that we are going to update.
        this.triggerMethod.apply(this, ['before:frame:update'].concat(args));

        // Collect new data.
        if (data && data.bulk) {
            this.buffer.concat(data.bulk)
        } else if (data && data.timestamp) {
            this.buffer.push(data.timestamp, data.frame);
        }

        // Clear data if live mode is one
        if (options && options.live) {
            this.buffer.flushBefore(focus[0]);
        }

        // Notify that we are updating.
        this.triggerMethod.apply(this, ['frame:update'].concat(args));

        // Render only if required.
        if (options && options.render) {
            this.timescale.domain(focus);
            this._render();
        }
    },

    // Handle `frame:update` event.
    onFrameUpdate: function() { /* default implementation: do nothing */ },

    // Handle `before:render` event.
    onBeforeRender: function() { /* default implementation: do nothing */ },

    // Internal method to render the widget.
    _render: function() {
        var args = Array.prototype.slice.call(arguments);

        // Notify that we are going to render.
        this.triggerMethod.apply(this, ['before:render'].concat(args));

        // nothing to render...

        // Notify that we are rendering.
        this.triggerMethod.apply(this, ['render'].concat(args));
    },

    // Handle `render` event.
    onRender: function() { /* default implementation: do nothing */ },

    // Handle `before:ruler:focus:update` event.
    onBeforeRulerFocusUpdate: function() { /* default implementation: do nothing */ },

    // Internal method to notifying widget that the ruler's focus just changed.
    // `Coordinate` is the coordinate of the ruler between [0..1].
    // `Direction` is the `left` or `right` direction in which the ruler was dragged.
    rulerFocusChanged: function (coordinate, direction, options) {

        // Set default options.
        options = defaultsDeep({}, options, {
            delta: this.options.theme.ruler.lookahead
        });

        // Keep track of last focused frame.
        this._lastFocusedFrame = this._focusedFrame;

        // Get exact matching timestamp.
        var exactTimestamp = this.timescale.invert(this.timescale.range()[1]*coordinate).getTime();

        // Get new focused frame.
        this._focusedFrame = this._findFocusedFrame(coordinate, direction, exactTimestamp, options.delta);

        this.triggerMethod.apply(this, ['before:ruler:focus:update', coordinate, direction, exactTimestamp, this._focusedFrame, this._lastFocusedFrame]);

        // Update the name of his widget.
        if (ensure(this._focusedFrame, 'data.name')) {
            this._$name.text(this._focusedFrame.data.name);
        }

        // Hide widget if it does not have any state (meaning it disappeared).
        if (missing(this._focusedFrame, 'data.event.state')) {
            this.$el.css('opacity', this.options.theme.element.inactive.opacity);
        } else {
            this.$el.css('opacity', this.options.theme.element.active.opacity);
        }

        this.triggerMethod.apply(this, ['ruler:focus:update', coordinate, direction, exactTimestamp, this._focusedFrame, this._lastFocusedFrame]);
    },

    // Handle `ruler:focus:update` event.
    onRulerFocusUpdate: function() { /* default implementation: do nothing */ },

    // Internal method used to find the focused frame.
    _findFocusedFrame: function(coordinate, direction, exactTimestamp, delta) {
        var position = this.timescale.range()[1] * coordinate;

        // Workout timestamp interval.
        var minTimestamp = this.timescale.invert(parseInt(position-delta)).getTime();
        var maxTimestamp = this.timescale.invert(parseInt(position+delta)).getTime();

        var focusedFrame = this.buffer.inside(
            [direction == 'left' ? minTimestamp : exactTimestamp, direction == 'right' ? maxTimestamp : exactTimestamp],
            direction
        );

        return focusedFrame;
    },

    // Import the `triggerMethod` to trigger events with corresponding
    // methods if the method exists
    triggerMethod: Debugger.triggerMethod
});



// Widgets' mixins.
// ----------------

Widgets.Mixins = {

    // **StateChart mixin.**
    StateChart: {
        initD3StateChart: function () {
            this.state_chart = this.svg.insert('g', '.markers').attr({class: 'state area'}).selectAll('rect');
            this.state_chart_border = this.svg.insert('path', '.markers').attr({class: 'state border'});
            this.state_chart_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'state border pending'});
        },
        renderD3StateChart: function () {
            var self = this;

            /* state_chart */
            var chart = this.state_chart = this.state_chart.data(
                this.buffer.select(function (d) {
                    return ensure(d, 'data.event.type', 'update');
                }),
                function (d) {
                    return d.timestamp
                }
            );

            chart.enter().append('rect').attr({
                x: function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                },
                y: function (d) {
                    return self.computed('svg.height') - self.stateScale(self.stateFn(d.data));
                },
                width: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                },
                height: function (d) {
                    return self.stateScale(self.stateFn(d.data))
                }
            });
            chart.attr({
                x: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                },
                y: function (d) {
                    return self.computed('svg.height') - self.stateScale(self.stateFn(d.data))
                },
                width: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                },
                height: function (d) {
                    return self.stateScale(self.stateFn(d.data))
                }
            });
            chart.exit().remove();

            /* border */
            var line = d3.svg.line()
                .x(function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                })
                .y(function (d) {
                    if (ensure(d, 'data.event.type', 'update')) {
                        return self.computed('svg.height') - self.stateScale(self.stateFn(d.data)) - self.options.theme.device.state.border.width/2;
                    } else {
                        return self.computed('svg.height') + self.options.theme.device.state.border.width;
                    }
                })
                .interpolate("step-after");
            this.state_chart_border.datum(
                this.buffer.all(),
                function (d) {
                    return d.timestamp
                })
                .attr("d", line);

            /* extra border */
            var last = this.buffer.last();
            if (last) {
                this.state_chart_extra.attr({
                    x1: self.timescale(self.dateFn(last.timestamp)),
                    y1: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.stateScale(self.stateFn(last.data)) - self.options.theme.device.state.border.width/2;
                        } else {
                            return self.computed('svg.height') + self.options.theme.device.state.border.width;
                        }
                    },
                    x2: self.timescale(self.dateFn(last.next.timestamp)),
                    y2: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.stateScale(self.stateFn(last.data)) - self.options.theme.device.state.border.width/2;
                        } else {
                            return self.computed('svg.height') + self.options.theme.device.state.border.width;
                        }
                    }
                });
            }
        },

        updateD3StateChartFocus: function(focused, unfocused) {
            var chart = this.state_chart.data(
                _.compact([focused, unfocused]),
                function (d) {
                    return d.timestamp
                }
            );

            chart.attr({
                class: function(d) {
                    return d == focused ? 'focused' : ''
                }
            });
        },

        destroyD3StateChart: function () {
            this.state_chart.remove(); delete this.state_chart;
            this.state_chart_border.remove(); delete this.state_chart_border;
            this.state_chart_extra.remove(); delete this.state_chart_extra;
        }
    },

    // **StateChart mixin.**
    ValueChart: {
        initD3ValueChart: function () {
            this.value_chart = this.svg.insert('g', '.markers').attr({class: 'value area'}).selectAll('rect');
            //this.value_chart = this.svg.insert('path', '.markers').attr({class: 'value area'});
            this.value_chart_border = this.svg.insert('path', '.markers').attr({class: 'value border'});
            this.value_chart_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'value border pending'});
        },
        renderD3ValueChart: function () {
            var self = this;

            /* state_chart */
            var chart = this.value_chart = this.value_chart.data(
                this.buffer.select(function (d) {
                    return ensure(d, 'data.event.type', 'update');
                }),
                function (d) {
                    return d.timestamp
                }
            );

            chart.enter().append('rect').attr({
                x: function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                },
                y: function (d) {
                    return self.computed('svg.height') - self.valueScale(self.valueFn(d.data));
                },
                width: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                },
                height: function (d) {
                    return self.valueScale(self.valueFn(d.data))
                }
            });
            chart.attr({
                x: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                },
                y: function (d) {
                    return self.computed('svg.height') - self.valueScale(self.valueFn(d.data))
                },
                width: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                },
                height: function (d) {
                    return self.valueScale(self.valueFn(d.data))
                }
            });
            chart.exit().remove();

            /* border */
            var line = d3.svg.line()
                .x(function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                })
                .y(function (d) {
                    if (ensure(d, 'data.event.type', 'update')) {
                        return self.computed('svg.height') - self.valueScale(self.valueFn(d.data)) - self.options.theme.device.state.border.width/2;
                    } else {
                        return self.computed('svg.height') + self.options.theme.device.state.border.width;
                    }
                })
                .interpolate("step-after");
            this.value_chart_border.datum(
                this.buffer.all(),
                function (d) {
                    return d.timestamp
                })
                .attr("d", line);

            /* extra border */
            var last = this.buffer.last();
            if (last) {
                this.value_chart_extra.attr({
                    x1: self.timescale(self.dateFn(last.timestamp)),
                    y1: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.valueScale(self.valueFn(last.data)) - self.options.theme.device.state.border.width/2;
                        } else {
                            return self.computed('svg.height') + self.options.theme.device.state.border.width;
                        }
                    },
                    x2: self.timescale(self.dateFn(last.next.timestamp)),
                    y2: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.valueScale(self.valueFn(last.data)) - self.options.theme.device.state.border.width/2;
                        } else {
                            return self.computed('svg.height') + self.options.theme.device.state.border.width;
                        }
                    }
                });
            }
        },

        updateD3ValueChartFocus: function(focused, unfocused) {
            var chart = this.value_chart.data(
                _.compact([focused, unfocused]),
                function (d) {
                    return d.timestamp
                }
            );

            chart.attr({
                class: function(d) {
                    return d == focused ? 'focused' : ''
                }
            });
        },

        destroyD3ValueChart: function () {
            this.value_chart.remove(); delete this.value_chart;
            this.value_chart_border.remove(); delete this.value_chart_border;
            this.value_chart_extra.remove(); delete this.value_chart_extra;
        }
    },

    // **Markers mixin.**
    Markers: {
        initD3Markers: function() {
            this.markers = this.svg.append('g').attr({class: 'markers'}).selectAll('.marker');
        },

        renderD3Markers: function () {
            var self = this;

            var markers = this.markers = this.markers.data(
                this.buffer.reject(function (d) {
                    return _.isEmpty(d.data.decorations);
                }),
                function (d) {
                    return d.timestamp
                }
            );

            markers.enter().append("g")
                .attr({
                    class: "marker"
                })
                .append("use")
                .attr({
                    'xlink:href': function (d) {
                        if (d.data.decorations.length > 1 /* if more than on decorations AND */ && (
                                // some decoration are `state` related
                            _.some(d.data.decorations, {'type': 'state'})
                            || // or
                                // some decoration are `access` related
                            _.some(d.data.decorations, {'type': 'access'}))
                        ) {
                            return "#magnify"
                        } else {
                            return "#" + d.data.decorations[0].picto;
                        }
                    },
                    'class': "decoration",
                    'transform':
                        'scale('+this.options.theme.pictogram.scale+') ' +
                        'translate('+
                        /* x */ -(this.options.theme.pictogram.dimension.height * this.options.theme.pictogram.scale)/2 + ',' +
                        /* y */ (this.computed('svg.height') - this.options.theme.pictogram.dimension.height * this.options.theme.pictogram.scale)/2 +
                        ')'
                })
                .on("click", function (d) {
                    self.triggerMethod.apply(this, ['marker:click'].concat([d.data.decorations]));
                });
            markers.attr({
                transform: function (d) {
                    return "translate(" + self.timescale(self.dateFn(d.timestamp)) + ", 0)";
                }
            });
            markers.exit().remove()
        },

        destroyD3Markers: function() {
            this.markers.remove(); delete this.markers;
        }
    },

    // **Aside mixin.**
    Aside: {
        initUIAside: function() {
            this._$aside.css({
                'height': parseInt(this.computed('widget.height'))*0.6 + "px",
                'margin-top': parseInt(this.computed('widget.height'))*0.2 + "px",
                'line-height': parseInt(this.computed('widget.height'))*0.6 + "px",
                'visibility': 'visible'
            });
        },

        updateAsidePosition: function(position, direction) {
            var align = 'left';

            if (position < this._$aside.width()) {
                align = 'right';
            } else if (position > this.computed('svg.width') - this._$aside.width()) {
                align = 'left';
            } else {
                align = direction == 'left' ? 'right' : 'left';
            }

            this._$aside.css({
                'left': align == 'right' ? position + this.options.theme.dashboard.sidebar.width + 2 * this.options.theme.ruler.width : 'auto',
                'right': align == 'right' ? 'auto' : this.computed('svg.width') - position
            });
        }
    },

    // **Focus mixin.**
    Focus: {
        onFocusChange: function(brush) {
            this.timescale.domain(brush.empty() ? brush.x().domain() : brush.extent());
            this._render();
        }
    },

    // **Timeline grid mixin.**
    TimelineGrid: {
        initD3TimelineGrid: function() {
            this.xTimelineGridAxis = d3.svg.axis()
                .scale(this.timescale)
                .tickSize(this.computed('svg.height'))
                .orient("bottom")
                .tickFormat("");
            this.xTimelineGridAxisGroup = this.svg.insert('g', '.markers').append("g")
                .attr({'class': 'x grid left'})
                .call(this.xTimelineGridAxis);
        },

        renderTimelineGrid: function () {
            this.xTimelineGridAxisGroup.call(this.xTimelineGridAxis);
        },

        destroyTimelineGrid: function() {
            this.xTimelineGridAxisGroup.remove(); delete this.xTimelineGridAxisGroup;
        }
    },

    // **Eventline actions mixin.**
    EventlineActions: {
        initUIEventlineActions: function() {
            var self = this;

            // Button used to focus debugger on this eventline
            this._$focusButton = $('<button type="button "></button>"').css({
                'margin-top': this.computed('widget.height') * 0.1,
                'height': this.computed('widget.height') * 0.8,
                'margin-left': this.computed('widget.height') * 0.1,
                'width': this.computed('widget.height') * 0.8,
                'background-size': this.computed('widget.height')*0.6 + 'px ' + this.computed('widget.height')*0.6 + 'px'
            }).addClass(
                self.attributes.focused ? 'picto-focused' : 'picto-focus'
            ).on('click', function() {
                self.triggerMethod.apply(this, ['eventline:focus:request'].concat(self.attributes));
            });

            // Attach focus button to sidemenu
            this._$sidemenu.append(this._$focusButton);

            // Catch click on eventline name
            this._$name.on('click', function(){
                self.triggerMethod.apply(this, ['eventline:name:click'].concat(self.attributes));
            }).css({
                'cursor': 'pointer'
            });
        },

        markAsFocused: function(focused) {
            this.attributes.focused = focused;
            this._$focusButton.addClass(focused ? 'picto-focused' : 'picto-focus');
            this._$focusButton.removeClass(focused ? 'picto-focus' : 'picto-focused');
        }
    }
};

// @include widgets/debugger.focusline.js
// @include widgets/debugger.timeline.js
// @include widgets/debugger.devices.js
// @include widgets/debugger.programs.js
