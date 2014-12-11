// Widgets.Program
// ---------------

Widgets.Program = Widgets.Widget.extend({

    defaults: {
        kind: 'program',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onInitUI: function () {
        this.initUIEventlineActions();
    },

    onInitD3: function () {
        this.state = this.svg.append('g').attr({class: 'program state'}).selectAll('rect');
        this.initD3Markers();
        this.initD3TimelineGrid();
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

        var self = this;

        //
        // Render State
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
            width: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
            },
            class: function (d) {
                return d.data.event.state.name;
            },
            y: (self.computed('svg.height') - self.options.theme.program.state.height) / 2,
            height: self.options.theme.program.state.height,
            rx: self.options.theme.program.state.radius.x,
            ry: self.options.theme.program.state.radius.y
        });
        state.attr({
            x: function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            width: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
            },
            class: function (d) { return d.data.event.state.name; }
        });
        state.exit().remove();

        //
        // Render Markers
        //
        this.renderD3Markers();

        //
        // Render the Timeline Grid
        //
        this.renderTimelineGrid();
    },

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
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

_.extend(
    Widgets.Program.prototype,
    Widgets.Mixins.TimelineGrid,
    Widgets.Mixins.Markers,
    Widgets.Mixins.Focus,
    Widgets.Mixins.EventlineActions
);
