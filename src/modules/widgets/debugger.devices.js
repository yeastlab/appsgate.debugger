// Widgets.Device
// --------------

Widgets.Device = Widgets.Widget.extend({

    onInitUI: function () {
        // Setup eventline action
        this.initUIEventlineActions();

        // Device pictogram used to represent its current state
        this._$picto = $('<div/>').addClass('picto').css({
            'height': this.computed('widget.height'),
            'line-height': this.computed('svg.height') + 'px',
            'background-size': this.computed('svg.height') + 'px ' + this.computed('svg.height') + 'px',
            'width': this.computed('svg.height')
        });
        this._$sidebar.append(this._$picto);
    },

    onInitD3: function () {
        Widgets.Widget.prototype.onInitD3.apply(this, arguments);

        // Status is used to display connection/disconnection status
        this.status = this.svg.append('g').attr({class: 'status'}).selectAll('line');

        this.initD3Markers();
        this.initD3TimelineGrid();
    },

    onDestroyD3: function() {
        Widgets.Widget.prototype.onDestroyD3.apply(this, arguments);

        // Destroy status
        this.status.remove(); delete this.status;

        // Destroy markers
        this.destroyD3Markers();

        // Destroy TimelineGrid
        this.destroyTimelineGrid();
    },

    onRender: function () {
        Widgets.Widget.prototype.onRender.apply(this, arguments);

        var self = this;

        //
        // Render status
        //
        var status = this.status = this.status.data(
            this.buffer.select(function (d) {
                return ensure(d, 'data.event') &&
                    (  d.data.event.type == 'update'
                        || d.data.event.type == 'connection'
                        || d.data.event.type == 'disconnection');
            }),
            function (d) {
                return d.timestamp
            }
        );

        status.enter().append('line').attr({
            x1: function (d) {
                return self.timescale(self.dateFn(d.timestamp));
            },
            y1: this.computed('svg.height') - self.options.theme.status.border.width/2,
            x2: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp));
            },
            y2: this.computed('svg.height') - self.options.theme.status.border.width/2,
            class: function (d) { return d.data.event.type }
        });
        status.attr({
            x1: function (d) {
                return self.timescale(self.dateFn(d.timestamp))
            },
            x2: function (d) {
                return self.timescale(self.dateFn(d.next.timestamp))
            },
            class: function (d) { return d.data.event.type }
        });
        status.exit().remove();

        // Render markers
        this.renderD3Markers();

        // Render the Timeline Grid
        this.renderTimelineGrid();
    },

    onRulerFocusUpdate: function (coordinate, direction, timestamp, focusedFrame, lastFocusedFrame) {
        Widgets.Widget.prototype.onRulerFocusUpdate.apply(this, arguments);

        var status = this.status.data(
            _.compact([focusedFrame, lastFocusedFrame]),
            function (d) {
                return d.timestamp
            }
        );

        status.classed('focused', function(d) {
            return d == focusedFrame
        });
    }
});

_.extend(
    Widgets.Device.prototype,
    Widgets.Mixins.TimelineGrid,
    Widgets.Mixins.Markers,
    Widgets.Mixins.Focus,
    Widgets.Mixins.EventlineActions
);

// @include devices/debugger.temperature.js
// @include devices/debugger.illumination.js
// @include devices/debugger.switch.js
// @include devices/debugger.contact.js
// @include devices/debugger.keycardswitch.js
// @include devices/debugger.smartplug.js
// @include devices/debugger.colorlight.js
// @include devices/debugger.domicube.js
// @include devices/debugger.mediaplayer.js
