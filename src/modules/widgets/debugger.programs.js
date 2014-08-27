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

    onInitUI: function () {
        this._$name = $('<div/>').addClass('title').css({
            'line-height': this.computed('svg.height') + 'px'
        });
        this._$sidebar.append(this._$name);
    },

    onInitD3: function () {
        // state is used to display the program's state
        this.state = this.svg.append('g').attr({class: 'state'}).selectAll('rect');

        // markers is used to display decoration markers
        this.initD3Markers();
    },

    onFrameUpdate: function () {
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
            fill: function (d) {
                if (d.data.event.state.name === 'disabled') {
                    return 'orange';
                } else if (d.data.event.state.name == 'enabled') {
                    return 'yellow';
                } else if (d.data.event.state.name == 'invalid') {
                    return 'grey';
                }
            }
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
            fill: function (d) {
                if (d.data.event.state.name === 'disabled') {
                    return 'orange';
                } else if (d.data.event.state.name == 'enabled') {
                    return 'yellow';
                } else if (d.data.event.state.name == 'invalid') {
                    return 'grey';
                }
            },
            rx: 5,
            ry: 5
        });
        state.exit().remove();

        //
        // markers
        //
        this.updateD3Markers();
    },

    onRulerFocusUpdate: function (position, timestamp, frame) {
        // update `aside` position
        if (position < this.computed('svg.width') / 2) {
            this._$aside.css({
                'left': position + this.options.placeholder.sidebar.width + this.options.ruler.width / 2,
                'right': 'auto'
            });
        } else {
            this._$aside.css({
                'left': 'auto',
                'right': this.computed('svg.width') + this.options.ruler.width / 2 - position
            });
        }

        if (frame && frame.data) {
            this._$name.text(frame.data.name);
        }
    }
});

_.extend(Widgets.Program.prototype, Widgets.Mixins.Markers);