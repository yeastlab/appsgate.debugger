/**
 * Base class for Program widget.
 */

Widgets.Program = Widgets.Widget.extend({

    defaults: {
        kind: 'program',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onInitD3: function () {
        // state is used to display the program's state
        this.state = this.svg.append('g').attr({class: 'program state'}).selectAll('rect');

        // markers is used to display decoration markers
        this.initD3Markers();
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

        var self = this;

        //
        // state
        //
        var state = this.state = this.state.data(
            this.buffer.select(function (d) {
                return ensure(d, 'data.event');
            }),
            function (d) {
                return d.timestamp
            }
        );

        state.enter().append('rect').attr({
            x: function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            y: function (d) {
                return 0.25*self.computed('svg.height');
            },
            width: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
            },
            height: function (d) {
                return 0.5*self.computed('svg.height');
            },
            class: function (d) { return d.data.event.state.name; }
        });
        state.attr({
            x: function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            y: function (d) {
                return 0.25*self.computed('svg.height');
            },
            width: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
            },
            height: function (d) {
                return 0.5*self.computed('svg.height');
            },
            class: function (d) { return d.data.event.state.name; },
            rx: 5,
            ry: 5
        });
        state.exit().remove();

        //
        // markers
        //
        this.renderD3Markers();
    },

    onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
        // update state
        var state = this.state.data(
            _.compact([focusedFrame, lastFocusedFrame]),
            function (d) {
                return d.timestamp
            }
        );

        state.classed('focused', function (d) {
            return d == focusedFrame
        });
    }
});

_.extend(Widgets.Program.prototype, Widgets.Mixins.Markers, Widgets.Mixins.Focus);