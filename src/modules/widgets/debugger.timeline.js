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

    onInitUI: function () {
        var $title = $('<span/>')
            .addClass('title')
            .css({
                'line-height': parseInt(this.options.height) + "px"
            })
            .text(this.attributes.name);

        this._$sidebar.append($title);
    },

    onInitD3: function () {
        this.xAxis = d3.svg.axis()
            .scale(this.timescale)
            .orient(this.attributes.orientation);

        this.xAxisGroup = this.svg.append("g")
            .attr({'class': 'x axis ' + this.attributes.orientation})
            .call(this.xAxis);
    },

    onFrameUpdate: function () {
        this.xAxisGroup.call(this.xAxis);
    }
});