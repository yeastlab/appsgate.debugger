/**
 * Temperature widget.
 */

Widgets.Temperature = Widgets.Device.extend({

    defaults: {
        kind: 'temperature',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onInitUI: function () {
        Widgets.Device.prototype.onInitUI.apply(this, arguments);

        this._$aside.css({
            'line-height': parseInt(this.computed('svg.height')) + "px"
        });
    },

    onBeforeInitD3: function () {
        if (_.isFunction(Widgets.Device.prototype.onBeforeInitD3)) {
            Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
        }

        // setup d3 functions
        this.valueFn = function (d) {
            try {
                if (d.timestamp) {
                    return parseInt(d.data.event.state.value);
                } else {
                    return parseInt(d.event.state.value);
                }
            } catch (e) {
                return 0;
            }
        };
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.y = d3.scale.linear()
            .range([1, this.computed('svg.height')-1]);

        this.initD3Chart();
    },

    onFrameUpdate: function () {
        Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);

        var self = this;

        // update domain
        this.y.domain(d3.extent(
            self.buffer.select(function (d) {
                return ensure(d.data, 'event') && d.data.event.type == 'update'}
            ), self.valueFn)
        );

        this.updateD3Chart();
    },

    onRulerFocusUpdate: function (position, timestamp, frame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (frame && frame.data) {
            if (frame.data.event.type == 'update' && frame.data.event.state.status == 2) {
                this._$picto.attr({class: 'picto'}).text(this.valueFn(frame.data)+'°');
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-temperature_type'}).text('');
            }
        } else {
            this._$aside.text('');
        }
    }
});

_.extend(Widgets.Temperature.prototype, Widgets.Mixins.Chart);