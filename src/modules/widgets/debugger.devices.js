/**
 * Base class for Device widget.
 */

Widgets.Device = Widgets.Widget.extend({

    onInitUI: function () {
        this._$picto = $('<div/>').addClass('picto').css({
            'height': this.computed('svg.height'),
            'line-height': this.computed('svg.height') + 'px',
            'background-size': this.computed('svg.height') + 'px ' + this.computed('svg.height') + 'px',
            'width': this.computed('svg.height')
        });
        this._$sidebar.append(this._$picto);
    },

    onInitD3: function () {
        Widgets.Widget.prototype.onInitD3.apply(this, arguments);

        // status is used to display connection/disconnection status
        this.status = this.svg.append('g').attr({class: 'status'}).selectAll('line');

        // markers is used to display decoration markers
        this.initD3Markers();
    },

    onDestroyD3: function() {
        Widgets.Widget.prototype.onDestroyD3.apply(this, arguments);

        // destroy status
        this.status.remove(); delete this.status;

        // destroy markers
        this.destroyD3Markers();
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

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
            class: function (d) { return d.data.event.type },
            'stroke-linecap': 'round',
            'stroke-dasharray': '1, 5'
        });
        status.attr({
            x1: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            },
            x2: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp))
            },
            class: function (d) { return d.data.event.type },
            'stroke-linecap': 'round',
            'stroke-dasharray': '1, 5'
        });
        status.exit().remove();

        // Markers
        this.renderD3Markers();
    },

    onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Widget.prototype.onRulerFocusUpdate.apply(this, arguments);

        // update focus
        var status = this.status.data(
            _.compact([focusedFrame, lastFocusedFrame]),
            function (d) {
                return d.timestamp
            }
        );

        status.classed('focused', function(d) {
            return d == focusedFrame
        });
    }
});

_.extend(Widgets.Device.prototype, Widgets.Mixins.Markers, Widgets.Mixins.Focus);

// Specific devices
// @include devices/debugger.temperature.js
// @include devices/debugger.switch.js
// @include devices/debugger.contact.js
// @include devices/debugger.keycardswitch.js
// @include devices/debugger.smartplug.js
// @include devices/debugger.colorlight.js
