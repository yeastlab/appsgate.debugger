// Widgets.Focusline
// -----------------

Widgets.Focusline = Widgets.Widget.extend({

    defaults: {
        kind: 'focusline',
        live: false
    },

    onBeforeInitD3: function() {
        this.floatingTimeFormat = d3.time.format("%H:%M:%S");
    },

    onInitD3: function () {
        Widgets.Widget.prototype.onInitD3.apply(this, arguments);

        var self = this;

        // Compute some properties
        this.compute('axis.height', 'this.options.theme.axis.tick.height + this.options.theme.axis.label.height + this.options.theme.axis.stroke.width');

        // Define y scale
        this.y = d3.scale.linear()
            .range([0, this.computed('svg.height') - this.computed('axis.height')]);

        // Define chart for drawing events.
        this.chart = this.svg.append('g').attr({class: 'focusline'}).selectAll('rect');

        // Add ruler shadow
        this.rulerShadow = this.svg.append('rect').attr({
            'class': 'ruler-shadow',
            'width': this.options.theme.focusline.ruler_shadow.width,
            'height': this.computed('svg.height') - this.computed('axis.height')
        });

        // Add focused time text
        this.focusedTime = this.svg.append('text').attr({
            'y': (this.computed('svg.height') - this.options.theme.focusline.focused_time.label.height)/2,
            'line-height': this.options.theme.focusline.focused_time.label.height
        });

        this.xAxis = d3.svg.axis()
            .scale(this.timescale)
            .tickSize(this.options.theme.axis.tick.height)
            .orient(this.attributes.orientation);
        if( this.attributes.timeFormat) {
            this.xAxis.tickFormat(this.attributes.timeFormat);
        }

        this.xAxisGroup = this.svg.append("g")
            .attr({
                'class': 'x axis ' + this.attributes.orientation,
                'transform': 'translate(' + self.options.theme.focusline.selector.handle.width/2 +',' + (this.computed('svg.height') - this.computed('axis.height') - this.options.theme.axis.stroke.width)+ ')'
            })
            .call(this.xAxis);

        if (!this.attributes.live) {
            // Define context for displaying focused area.
            this.context = this.svg.append("g").attr("class", "context");

            // Define a brush for focus selection.
            this.brush = d3.svg.brush().x(this.timescale)
                .on('brush', function () {
                    var extent = self.brush.extent(),
                        diff = self.timescale(extent[1]) - self.timescale(extent[0]),
                        min = self.options.theme.focusline.selector.min_width,
                        max = self.options.theme.focusline.selector.max_width,
                        resize = false;

                    // Check if brush extent is not too big or too small
                    if (min && (diff < min)) {
                        resize = true;
                        if (self.timescale(extent[0]) + min > self.computed('svg.width')) {
                            extent[1] = self.timescale.invert(self.computed('svg.width'));
                            extent[0] = self.timescale.invert(self.computed('svg.width') - min)
                        } else {
                            extent[1] = self.timescale.invert(self.timescale(extent[0]) + min);
                        }
                    } else if (max && (diff > max)) {
                        resize = true;
                        extent[1] = self.timescale.invert(self.timescale(extent[0]) + max);
                    }

                    // Resize the extent if required
                    if (resize) {
                        self.brush.extent(extent)(d3.select(this));
                    }

                    // Update brush resize handles
                    self.context.select('.mask.left').attr({
                        'x': 0,
                        'width': self.timescale(extent[0])
                    });
                    self.context.select('.mask.right').attr({
                        'x': self.timescale(extent[1]) + self.options.theme.focusline.selector.handle.width,
                        'width': self.computed('svg.width') - self.timescale(extent[1])
                    });

                    // Notify that brush selection just changed
                    self.triggerMethod.apply(self, ['focus:change'].concat([self.brush]));
                })
                .on('brushend', function () {
                    var extent = self.brush.empty() ? self.brush.x().domain() : self.brush.extent();
                    var width = parseInt(self.timescale(extent[1]) - self.timescale(extent[0]));
                    self.triggerMethod.apply(self, ['brush:resize'].concat([width]));
                });

            // Attach brush to context
            var brushGroup = this.brushGroup = this.context.append("g")
                .attr("class", "x brush")
                .call(this.brush);
            brushGroup.selectAll("rect")
                .attr("y", this.options.theme.focusline.selector.border.width / 2)
                .attr("height", this.computed('svg.height') - this.computed('axis.height') - this.options.theme.focusline.selector.border.width);

            // Keep reference to brush extent node
            this.brushExtent = this.brushGroup.select('rect.extent');

            // Add brush selector mask
            this.context.selectAll('.brush').append('rect').attr('class', 'mask left');
            this.context.selectAll('.brush').append('rect').attr('class', 'mask right');
            this.context.selectAll('.brush rect.mask').attr({
                'y': this.options.theme.focusline.selector.mask.border.width / 2,
                'height': this.computed('svg.height') - this.computed('axis.height') - this.options.theme.focusline.selector.mask.border.width
            });

            // Add brush selector handles
            this.context.selectAll('.resize').append('rect').attr({
                'class': 'handle',
                'width': self.options.theme.focusline.selector.handle.width,
                'height': this.computed('svg.height') - this.computed('axis.height')
            });

            // Prevent clearing the brush
            var oldBrushMouseDownHandler = brushGroup.on('mousedown.brush');
            brushGroup.on('mousedown.brush', function () {
                brushGroup.on('mouseup.brush', function () {
                    clearHandlers();
                });

                brushGroup.on('mousemove.brush', function () {
                    clearHandlers();
                    oldBrushMouseDownHandler.call(this);
                });

                function clearHandlers() {
                    brushGroup.on('mousemove.brush', null);
                    brushGroup.on('mouseup.brush', null);
                }
            });
        }

        // Hide placeholders
        this._$sidebar.hide();
        this._$aside.hide();
    },

    onDestroyD3: function() {
        Widgets.Widget.prototype.onDestroyD3.apply(this, arguments);

        delete this.y;
        delete this.xAxis;
        this.chart.remove(); delete this.chart;
        this.xAxisGroup.remove(); delete this.xAxisGroup;

        // remove brush stuff when in live mode
        if (!this.attributes.live) {
            this.context.remove(); delete this.context;
            this.brushGroup.remove(); delete this.brushGroup;
            delete this.brushExtent;
        }
    },

    onBeforeRender: function(data, focus, options) {
        // Setup brush extent to be the size of the whole timescale domain
        // just before the first rendering.
        if (_.isUndefined(this._isFirstRendering) && ! this.attributes.live) {
            this.brush.extent(this.timescale.domain())(this.brushGroup);
            this._isFirstRendering = false;
        }
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

        var self = this;

        // Update y domain
        this.y.domain(d3.extent(this.buffer.all(), function (d) {
            return d.data.value
        }));

        // Render event chart
        var chart = this.chart = this.chart.data(
            this.buffer.select(function (d) {
                return d.data.value > 0;
            }),
            function (d) {
                return d.timestamp
            }
        );

        chart.enter().append("rect").attr({
            'x': function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            'y': function (d) {
                return self.computed('svg.height') - self.computed('axis.height') - self.y(d.data.value)
            },
            'width': 1,
            'height': function (d) {
                return self.y(d.data.value)
            }
        });
        chart.attr({
            'x': function (d, i) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            'width': 1
        });
        chart.exit().remove();

        // Render time axis
        this.xAxisGroup.call(this.xAxis);
    },

    rulerFocusChanged: function (coordinate, direction, options) {
        var brushExtentOffset = this.attributes.live ? 0 : parseInt(this.brushExtent.attr('x'));
        var brushExtentWidth = this.attributes.live || this.brush.empty()? this.computed('svg.width') : parseInt(this.brushExtent.attr('width'));
        var focusedTextLabelWidth = parseInt(this.focusedTime.node().getBBox().width);

        // Workout ruler shadow placement and focused time
        var placement = brushExtentWidth * coordinate;
        var focusedTime = this.timescale.invert(brushExtentOffset + placement);

        // Setup ruler shadow placement
        this.rulerShadow.attr({
            transform: 'translate(' + (this.options.theme.ruler.width*2/3 + brushExtentOffset + placement) + ', 0)'
        });

        // Workout a nice placement for focused text label
        if (placement - focusedTextLabelWidth / 2 < 0) {
            placement = 0;
        } else if (placement + focusedTextLabelWidth / 2 > brushExtentWidth) {
            placement = brushExtentWidth - focusedTextLabelWidth;
        } else {
            placement = placement - focusedTextLabelWidth / 2 + this.options.theme.ruler.width;
        }

        // Setup focused text label placement and value
        this.focusedTime.attr({
            x: brushExtentOffset + placement
        }).text(this.floatingTimeFormat(focusedTime));
    }
});
