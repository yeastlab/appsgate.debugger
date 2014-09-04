/**
 * Contact widget.
 */

Widgets.ColorLight = Widgets.Device.extend({

    defaults: {
        kind: 'colorlight',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onBeforeInitD3: function () {
        if (_.isFunction(Widgets.Device.prototype.onBeforeInitD3)) {
            Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
        }

        // setup d3 functions
        this.valueFn = function (d) {
            try {
                if (d.timestamp) {
                    return d.data.event.state.state;
                } else {
                    return d.event.state.state;
                }
            } catch (e) {
                return 'false';
            }
        };
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.y = d3.scale.ordinal()
            .range([0, this.computed('svg.height') - 1])
            .domain(['false', 'true']);

        this.initD3Chart();
    },

    onFrameUpdate: function () {
        Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);

        var self = this;

        this.updateD3Chart();
    },

    onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto});
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-colorlight_type'});
        }

        this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
    }
});

_.extend(Widgets.ColorLight.prototype, Widgets.Mixins.Chart);