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

    onBeforeInitD3: function() {
        this.floatingTimeFormat = d3.time.format("%H:%M:%S");
    },

    onInitD3: function () {
        Widgets.Widget.prototype.onInitD3.apply(this, arguments);

        this.xAxis = d3.svg.axis()
            .scale(this.timescale)
            .orient(this.attributes.orientation);
        if( this.attributes.timeFormat) {
            this.xAxis.tickFormat(this.attributes.timeFormat);
        }

        this.xAxisGroup = this.svg.append('g')
            .attr({
                'class': 'x axis ' + this.attributes.orientation,
                'transform': 'translate(0,' + this.computed('svg.height') + ')'
            })
            .call(this.xAxis);

        this.focusedTime = this.xAxisGroup.append('text');
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

        // Redraw axis
        this.xAxisGroup.call(this.xAxis);
    },

    rulerFocusChanged: function (coordinate, direction, options) {
        var self = this;

        var timescaleWidth = this.timescale.range()[1];
        var placement, position = timescaleWidth * coordinate;
        var focusedTime = this.timescale.invert(position);

        // Set focused time label value
        this.focusedTime.text(this.floatingTimeFormat(focusedTime));

        // Get focused time label width
        var focusedTextLabelWidth = parseInt(this.focusedTime.node().getBBox().width);

        // Workout a nice placement for focused text label
        if (position - focusedTextLabelWidth / 2 < 0) {
            placement = 0;
        } else if (position + focusedTextLabelWidth / 2 > timescaleWidth) {
            placement = timescaleWidth - focusedTextLabelWidth;
        } else {
            placement = position - focusedTextLabelWidth / 2 + this.options.theme.ruler.width;
        }

        // Set timeline tick label opacity
        this.xAxisGroup.selectAll("text").style("fill-opacity", function (d) {
            return Math.abs(self.timescale(d) - placement - focusedTextLabelWidth / 2) < focusedTextLabelWidth ? 0 : 1;
        });

        // Setup focused text label placement and value
        this.focusedTime.attr({
            y: -9,
            x: placement
        });
    }
});

_.extend(Widgets.Timeline.prototype, Widgets.Mixins.Focus);
