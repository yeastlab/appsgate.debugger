/**
 * Switch widget.
 */

Widgets.Switch = Widgets.Device.extend({

    defaults: {
        kind: 'switch',
        buffer: {
            pairing: true
        }
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.y = d3.scale.quantize()
            .range([0, this.computed('svg.height') - 1])
            .domain([false, true]);

        this.spikes = this.svg.append('g').attr({class: 'spikes'}).selectAll('line');
        this.border = this.svg.insert('path', /* insert before */ '.markers').attr({class: 'border'});
        this.border_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'border pending'});
    },

    onFrameUpdate: function () {
        Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);

        var self = this;

        //
        // spikes
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
            y1: self.y(false),
            x2: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            },
            y2: self.y(true)
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
        // borders
        //
        var last = this.buffer.last();
        var line = d3.svg.line()
            .x(function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            })
            .y(function (d) {
                if (ensure(d, 'data.event.type', 'update')) {
                    return self.computed('svg.height') - 1;
                } else {
                    return self.computed('svg.height') + 2;
                }
            })
            .interpolate("step-after");
        this.border.datum(this.buffer.all(),
            function (d) {
                return d.timestamp
            })
            .attr('d', line);
        this.border_extra.attr({
            x1: self.timescale(self.dateFn(last.timestamp)),
            y1: function() {
                if (ensure(last, 'data.event.type', 'update')) {
                    return self.computed('svg.height') -1 ;
                } else {
                    return self.computed('svg.height') + 2;
                }
            },
            x2: self.timescale(self.dateFn(last.next.timestamp)),
            y2: function() {
                if (ensure(last, 'data.event.type', 'update')) {
                    return self.computed('svg.height') - 1;
                } else {
                    return self.computed('svg.height') + 2;
                }
            }
        });
    },

    onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto});
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-switch_type'});
        }

        // update focus
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