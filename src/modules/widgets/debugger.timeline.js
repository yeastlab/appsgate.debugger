// Widgets.Timeline
// ----------------

Widgets.Timeline = Widgets.Widget.extend({

    defaults: {
        kind: 'timeline',
        name: 'Timeline',
        orientation: 'top',
        buffer: {
            ignoreData: true
        }
    },

    onInitUI: function () {
        Widgets.Widget.prototype.onInitUI.apply(this, arguments);

        this._$name.text(this.attributes.name);
    },

    onInitD3: function () {
        Widgets.Widget.prototype.onInitD3.apply(this, arguments);

        this.xAxis = d3.svg.axis()
            .scale(this.timescale)
            .orient(this.attributes.orientation);
        if( this.attributes.timeFormat) {
            this.xAxis.tickFormat(this.attributes.timeFormat);
        }

        this.xAxisGroup = this.svg.append("g")
            .attr({
                'class': 'x axis ' + this.attributes.orientation,
                'transform': 'translate(0,' + this.computed('svg.height') + ')'
            })
            .call(this.xAxis);
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

        this.xAxisGroup.call(this.xAxis);
    },

    onRulerFocusUpdate: function (position, coordinate, timestamp, focusedFrame, lastFocusedFrame) {
        // do nothing
    }
});

_.extend(Widgets.Timeline.prototype, Widgets.Mixins.Focus);
