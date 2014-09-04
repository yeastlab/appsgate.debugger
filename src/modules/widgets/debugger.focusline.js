/**
 * Focusline widget.
 */

Widgets.Focusline = Widgets.Widget.extend({

    defaults: {
        kind: 'focusline'
    },

    onInitD3: function () {
        this.y = d3.scale.linear()
            .range([0, this.computed('svg.height')-1]);
        this.chart = this.svg.append('g').attr({class: 'focusline'}).selectAll('rect');
    },

    onFrameUpdate: function () {
        var self = this;

        this.y.domain(d3.extent(this.buffer.all(), function (d) {
            return d.data.value
        }));

        var chart = this.chart = this.chart.data(
            this.buffer.select(function (d) {
                return d.data.value > 0;
            }),
            function (d) {
                return d.timestamp
            }
        );

        chart.enter().append("rect").attr({
            'x': function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            'y': function (d) {
                return self.computed('svg.height') - self.y(d.data.value)
            },
            'width': this.computed('svg.width') / self.buffer.size(),
            'height': function (d) {
                return self.y(d.data.value)
            }
        });
        chart.attr({
            'x': function (d, i) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            'width': this.computed('svg.width') / self.buffer.size()
        });
        chart.exit().remove();
    }
});