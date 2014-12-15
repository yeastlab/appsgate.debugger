// Widgets.Temperature
// -------------------

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

        this.initUIAside();
    },

    onBeforeInitD3: function () {
        Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);

        // Setup d3 state functions
        this.stateFn = function (d) {
            return true;
        };

        // Setup d3 value functions
        this.valueFn = function (d) {
            try {
                if (d.timestamp) {
                    return parseFloat(d.data.event.state.value);
                } else {
                    return parseFloat(d.event.state.value);
                }
            } catch (e) {
                return 0.0;
            }
        };
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.stateScale = d3.scale.quantize()
            .range([0, this.computed('svg.height') - this.options.theme.device.state.border.width])
            .domain([false, true]);

        this.valueScale = d3.scale.linear()
            .range([0, this.computed('svg.height') - this.options.theme.device.state.border.width]);

        this.initD3StateChart();
        this.initD3ValueChart();
    },

    onDestroyD3: function() {
        Widgets.Device.prototype.onDestroyD3.apply(this, arguments);

        delete this.stateScale;
        delete this.valueScale;

        this.destroyD3StateChart();
        this.destroyD3ValueChart();
    },

    onRender: function () {
        Widgets.Device.prototype.onRender.apply(this, arguments);

        var self = this;

        this.valueScale.domain(d3.extent(
            self.buffer.select(function (d) {
                return ensure(d.data, 'event') && d.data.event.type == 'update'}
            ), self.valueFn)
        );

        this.renderD3StateChart();
        this.renderD3ValueChart();
    },

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-temperature_state_on'});
            this._$aside.text(parseFloat(this.valueFn(focusedFrame.data)).toFixed(2)+'°').css('visibility', 'visible');
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-temperature_type'}).text('');
            this._$aside.text('').css('visibility', 'hidden');
        }

        this.updateD3StateChartFocus(focusedFrame, lastFocusedFrame);
        this.updateD3ValueChartFocus(focusedFrame, lastFocusedFrame);
        this.updateAsidePosition(this.timescale.range()[1] * coordinate, direction);
    }
});

_.extend(Widgets.Temperature.prototype, Widgets.Mixins.StateChart, Widgets.Mixins.ValueChart, Widgets.Mixins.Focus, Widgets.Mixins.Aside);
