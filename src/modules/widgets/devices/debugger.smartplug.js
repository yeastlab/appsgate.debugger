/**
 * Contact widget.
 */

Widgets.SmartPlug = Widgets.Device.extend({

    defaults: {
        kind: 'smartplug',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onBeforeInitD3: function () {
        Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);

        // setup d3 functions
        this.valueFn = function (d) {
            try {
                if (d.timestamp) {
                    return parseBoolean(d.data.event.state.plugState);
                } else {
                    return parseBoolean(d.event.state.plugState);
                }
            } catch (e) {
                return false;
            }
        };
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.y = d3.scale.ordinal()
            .range([0, this.computed('svg.height') - 1])
            .domain([false, true]);

        this.initD3Chart();
    },

    onDestroyD3: function() {
        Widgets.Device.prototype.onDestroyD3.apply(this, arguments);

        delete this.y;
        this.destroyD3Chart();
    },

    onRender: function () {
        Widgets.Device.prototype.onRender.apply(this, arguments);

        this.renderD3Chart();
    },

    onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto});
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-smartplug_type'});
        }

        this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
    }
});

_.extend(Widgets.SmartPlug.prototype, Widgets.Mixins.Chart);