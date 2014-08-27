/**
 * Base class for Device widget.
 */

Widgets.Device = Widgets.Widget.extend({

    onInitUI: function () {
        this._$name = $('<div/>').addClass('title').css({
            'line-height': this.computed('svg.height') + 'px'
        });
        this._$picto = $('<div/>').addClass('picto').css({
            'height': this.computed('svg.height'),
            'line-height': this.computed('svg.height') + 'px',
            'background-size': this.computed('svg.height') + 'px ' + this.computed('svg.height') + 'px',
            'width': this.computed('svg.height')
        });
        this._$sidebar.append(this._$name, this._$picto);
    },

    onInitD3: function () {
        // status is used to display connection/disconnection status
        this.status = this.svg.append('g').attr({class: 'status'}).selectAll('line');

        // markers is used to display decoration markers
        this.initD3Markers();
    },

    onFrameUpdate: function () {
        var self = this;

        //
        // status
        //
        var status = this.status = this.status.data(
            this.buffer.select(function (d) {
                return ensure(d, 'data.event') &&
                    (  d.data.event.type == 'update'
                        || d.data.event.type == 'connection'
                        || d.data.event.type == 'disconnection');
            }),
            function (d) {
                return d.timestamp
            }
        );

        status.enter().append('line').attr({
            x1: function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            y1: this.computed('svg.height') - 1,
            x2: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp));
            },
            y2: this.computed('svg.height') - 1,
            stroke: function (d) {
                if (d.data.event.type === 'update' && d.data.event.state.status === 'problem') {
                    return 'orange';
                } else if (d.data.event.type == 'connection') {
                    return 'green';
                } else if (d.data.event.type == 'disconnection') {
                    return 'red';
                }
            },
            'stroke-width': 2,
            'stroke-linecap': 'round',
            'stroke-dasharray': "1, 5"
        });
        status.attr({
            x1: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            },
            x2: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp))
            }
        });
        status.exit().remove();

        // Markers
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

_.extend(Widgets.Device.prototype, Widgets.Mixins.Markers);

// Specific devices
// @include devices/debugger.temperature.js
// @include devices/debugger.switch.js
// @include devices/debugger.contact.js
// @include devices/debugger.keycardswitch.js
// @include devices/debugger.colorlight.js
