// Widgets.DomiCube
// ----------------

Widgets.DomiCube = Widgets.Device.extend({

    defaults: {
        kind: 'domicube',
        buffer: {
            pairing: true,
            shadowing: true
        }
    },

    onBeforeInitD3: function () {
        Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);

        // Setup d3 state functions
        this.stateFn = function (d) {
            return true;
        };
    },

    onInitD3: function () {
        Widgets.Device.prototype.onInitD3.apply(this, arguments);

        this.stateScale = d3.scale.quantize()
            .range([0, this.computed('svg.height') - this.options.theme.device.state.border.width])
            .domain([false, true]);

        this.initD3StateChart();
    },

    onDestroyD3: function () {
        Widgets.Device.prototype.onDestroyD3.apply(this, arguments);

        delete this.stateScale;

        this.destroyD3StateChart();
    },

    onRender: function () {
        Widgets.Device.prototype.onRender.apply(this, arguments);

        var self = this;

        // Render the chart
        this.renderD3StateChart();
    },

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto picto-domicube_state_on'});
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-domicube_type'});
        }

        this.updateD3StateChartFocus(focusedFrame, lastFocusedFrame);
    }
});

_.extend(Widgets.DomiCube.prototype, Widgets.Mixins.StateChart, Widgets.Mixins.Focus);
