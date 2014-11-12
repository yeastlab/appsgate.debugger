// Widgets.Illumination
// --------------------

Widgets.Illumination = Widgets.Device.extend({

    defaults: {
        kind: 'illumination',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onInitUI: function () {
        Widgets.Device.prototype.onInitUI.apply(this, arguments);

        this._$aside.css({
            'line-height': parseInt(this.computed('svg.height')) + "px",
            'visibility': 'visible'
        });
    },

    onBeforeInitD3: function () {
        Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);

        // Setup d3 functions
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
            .range([0, this.computed('svg.height') - this.options.theme.device.state.border.width]);

        this.initD3Chart();
    },

    onDestroyD3: function () {
        Widgets.Device.prototype.onDestroyD3.apply(this, arguments);

        delete this.y;
        this.destroyD3Chart();
    },

    onRender: function () {
        Widgets.Device.prototype.onRender.apply(this, arguments);

        var self = this;

        // Compute new domain for sensor.
        var domain = d3.extent(
            self.buffer.select(function (d) {
                    return ensure(d.data, 'event') && d.data.event.type == 'update'
                }
            ),
            self.valueFn
        );

        // Update y scale.
        this.y.domain([domain[0]*0.9, domain[1]*1.1]);

        // Render the chart
        this.renderD3Chart();
    },

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-illumination_state_on'});
            this._$aside.text(this.valueFn(focusedFrame.data) + 'Lux');
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-illumination_type'});
            this._$aside.text('');
        }

        this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
        this.updateAsidePosition(this.timescale.range()[1] * coordinate, direction);
    }
});

_.extend(Widgets.Illumination.prototype, Widgets.Mixins.Chart, Widgets.Mixins.Focus, Widgets.Mixins.Aside);
