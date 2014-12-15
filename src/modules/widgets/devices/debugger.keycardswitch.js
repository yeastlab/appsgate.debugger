// Widgets.KeycardSwitch
// ---------------------


Widgets.KeycardSwitch = Widgets.Device.extend({

    defaults: {
        kind: 'keycardswitch',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onBeforeInitD3: function () {
        Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);

        // Setup d3 functions
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
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.y = d3.scale.ordinal()
            .range([0, this.computed('svg.height') - this.options.theme.device.state.border.width])
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

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-'+focusedFrame.data.event.picto});
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-keycardswitch_type'});
        }

        this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
    }
});

_.extend(Widgets.KeycardSwitch.prototype, Widgets.Mixins.Chart);
