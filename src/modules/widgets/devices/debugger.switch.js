// Widgets.Switch
// --------------


Widgets.Switch = Widgets.Device.extend({

    defaults: {
        kind: 'switch',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.stateScale = d3.scale.quantize()
            .range([4, this.computed('svg.height') - this.options.theme.device.state.border.width])
            .domain([false, true]);

        this.spikes = this.svg.append('g').attr({class: 'spikes'}).selectAll('line');
        this.border = this.svg.insert('path', /* insert before */ '.markers').attr({class: 'state border'});
        this.border_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'state border pending'});
    },

    onDestroyD3: function() {
        Widgets.Device.prototype.onDestroyD3.apply(this, arguments);

        delete this.stateScale;

        this.spikes.remove(); delete this.spikes;
        this.border.remove(); delete this.border;
        this.border_extra.remove(); delete this.border_extra;
    },

    onRender: function () {
        Widgets.Device.prototype.onRender.apply(this, arguments);

        var self = this;

        //
        // Render spikes
        //
        var spikes = this.spikes = this.spikes.data(
            this.buffer.select(function (d) {
                return ensure(d, 'data.event.type', 'update');
            }),
            function (d) {
                return d.timestamp
            }
        );

        spikes.enter().append('line').attr({
            x1: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            },
            y1: self.stateScale(false),
            x2: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            },
            y2: self.stateScale(true)
        });
        spikes.attr({
            x1: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            },
            x2: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            }
        });
        spikes.exit().remove();

        //
        // Render borders
        //
        var line = d3.svg.line()
            .x(function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            })
            .y(function (d) {
                if (ensure(d, 'data.event.type', 'update')) {
                    return self.computed('svg.height') - self.options.theme.device.state.border.width/2;
                } else {
                    return self.computed('svg.height') + self.options.theme.device.state.border.width;
                }
            })
            .interpolate("step-after");
        this.border.datum(this.buffer.all(),
            function (d) {
                return d.timestamp
            })
            .attr('d', line);

        var last = this.buffer.last();
        if (last) {
            this.border_extra.attr({
                x1: self.timescale(self.dateFn(last.timestamp)),
                y1: function () {
                    if (ensure(last, 'data.event.type', 'update')) {
                        return self.computed('svg.height') - self.options.theme.device.state.border.width/2;
                    } else {
                        return self.computed('svg.height') + self.options.theme.device.state.border.width;
                    }
                },
                x2: self.timescale(self.dateFn(last.next.timestamp)),
                y2: function () {
                    if (ensure(last, 'data.event.type', 'update')) {
                        return self.computed('svg.height') - self.options.theme.device.state.border.width/2;
                    } else {
                        return self.computed('svg.height') + self.options.theme.device.state.border.width;
                    }
                }
            });
        }
    },

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto});
        } else {
            this._$picto.attr({class: 'picto picto-switch_type'});
        }

        var spikes = this.spikes.data(
            _.compact([focusedFrame, lastFocusedFrame]),
            function (d) {
                return d.timestamp
            }
        );

        spikes.classed('focused', function(d) {
            return d == focusedFrame
        });
    }
});
