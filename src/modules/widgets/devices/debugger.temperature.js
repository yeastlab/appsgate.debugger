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
            .range([0, this.computed('svg.height') - 1]);

        this.initD3Chart();
    },

    onDestroyD3: function() {
        Widgets.Device.prototype.onDestroyD3.apply(this, arguments);

        delete this.y;
        this.destroyD3Chart();
    },

    onRender: function () {
        Widgets.Device.prototype.onRender.apply(this, arguments);

        var self = this;

        // update domain
        this.y.domain(d3.extent(
            self.buffer.select(function (d) {
                return ensure(d.data, 'event') && d.data.event.type == 'update'}
            ), self.valueFn)
        );

        this.renderD3Chart();
    },

    onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);

        if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
            this._$picto.attr({class: 'picto'}).text(this.valueFn(focusedFrame.data)+'°');
        } else {
            // fallback
            this._$picto.attr({class: 'picto picto-temperature_type'}).text('');
        }

        this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
    }
});

_.extend(Widgets.Temperature.prototype, Widgets.Mixins.Chart, Widgets.Mixins.Focus);