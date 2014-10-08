// Widgets.Focusline
// -----------------

Widgets.Focusline = Widgets.Widget.extend({

    defaults: {
        kind: 'focusline'
    },

    onInitD3: function () {
        Widgets.Widget.prototype.onInitD3.apply(this, arguments);

        var self = this;

        this.y = d3.scale.linear()
            .range([0, this.computed('svg.height')-1]);

        // Define a brush for focus selection.
        this.brush = d3.svg.brush().x(this.timescale)
            .on('brush', function () {
                self.triggerMethod.apply(self, ['focus:change'].concat([self.brush]));
            })
            .on('brushend', function () {
                var extent = self.brush.empty() ? self.brush.x().domain() : self.brush.extent();
                var width = parseInt(self.timescale(extent[1]) - self.timescale(extent[0]));
                self.triggerMethod.apply(self, ['brush:resize'].concat([width]));
            });

        // Define chart for drawing events.
        this.chart = this.svg.append('g').attr({class: 'focusline'}).selectAll('rect');

        // Define context for displaying focused area.
        this.context = this.svg.append("g").attr("class", "context").append("g")
            .attr("class", "x brush")
            .call(this.brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", this.computed('svg.height') + 7);

    },

    onDestroyD3: function() {
        Widgets.Widget.prototype.onDestroyD3.apply(this, arguments);

        delete this.y;
        this.chart.remove(); delete this.chart;
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

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
