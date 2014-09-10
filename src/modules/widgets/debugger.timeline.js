/**
 * Timeline widget.
 */

Widgets.Timeline = Widgets.Widget.extend({

    defaults: {
        kind: 'timeline',
        name: 'Timeline',
        orientation: 'top',
        buffer: {
            ignoreData: true
        }
    },

    // @override
    onInitUI: function () {
        Widgets.Widget.prototype.onInitUI.apply(this, arguments);

        this._$name.text(this.attributes.name);
    },

    // @override
    onInitD3: function () {
        Widgets.Widget.prototype.onInitD3.apply(this, arguments);

        this.xAxis = d3.svg.axis()
            .scale(this.timescale)
            .orient(this.attributes.orientation);

        this.xAxisGroup = this.svg.append("g")
            .attr({'class': 'x axis ' + this.attributes.orientation})
            .call(this.xAxis);
    },

    // @override
    onFrameUpdate: function () {
        Widgets.Widget.prototype.onFrameUpdate.apply(this, arguments);

        this.xAxisGroup.call(this.xAxis);
    },

    // @override
    onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
        // do nothing
    }
});