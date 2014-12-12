// Widgets.Contact
// ---------------


Widgets.Contact = Widgets.Device.extend({

    defaults: {
        kind: 'contact',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onBeforeInitD3: function () {
        Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);

        // Setup d3 functions
        this.stateFn = function (d) {
            try {
                if (d.timestamp) {
                    return parseBoolean(d.data.event.state.value);
                } else {
                    return parseBoolean(d.event.state.value);
                }
            } catch (e) {
                return false;
            }
        };
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.stateScale = d3.scale.quantize()
            .range([0, this.computed('svg.height') - this.options.theme.device.state.border.width])
            .domain([false, true]);

        this.initD3StateChart();
    },

    onDestroyD3: function() {
        Widgets.Device.prototype.onDestroyD3.apply(this, arguments);

        delete this.stateScale;

        this.destroyD3StateChart();
    },

    onRender: function () {
        Widgets.Device.prototype.onRender.apply(this, arguments);

        this.renderD3StateChart();
    },

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-'+focusedFrame.data.event.picto});
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-contact_type'});
        }

        this.updateD3StateChartFocus(focusedFrame, lastFocusedFrame);
    }
});

_.extend(Widgets.Contact.prototype, Widgets.Mixins.StateChart);
