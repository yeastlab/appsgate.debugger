// Widgets.ColorLight
// ------------------

Widgets.ColorLight = Widgets.Device.extend({

    defaults: {
        kind: 'colorlight',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onBeforeInitD3: function () {
        Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);

        // Setup d3 value function
        this.valueFn = function (d) {
            try {
                if (d.timestamp) {
                    return parseBoolean(d.data.event.state.state);
                } else {
                    return parseBoolean(d.event.state.state);
                }
            } catch (e) {
                return false;
            }
        };

        // Setup d3 color function
        this.colorFn = function (d) {
            try {
                var state = d.timestamp ? d.data.event.state : d.event.state;
                return d3.hsl(
                        Math.max(0.0, Math.min(parseInt(state.color) / 65535.0, 1.0)) * 360,
                    Math.max(0.0, Math.min(parseInt(state.saturation) / 254.0, 1.0)),
                    Math.max(0.0, Math.min(parseInt(state.brightness) / 254.0, 1.0))
                );
            } catch (e) {
                return d3.hsl(0, 0, 0);
            }
        }
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
            this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto}).css({
                'background-color': this.valueFn(focusedFrame) ? this.colorFn(focusedFrame).toString() : 'transparent'
            });
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-colorlight_type'}).css({
                'background-color': 'transparent'
            });
        }

        this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
    }
});

_.extend(Widgets.ColorLight.prototype, Widgets.Mixins.Chart);
