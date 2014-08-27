var device_count = 0;
var devices = null;
var program_count = 0;
var programs = null;
var frameSent = 0;

// CONSTANT definitions

var MAX_DEVICES = 10;
var MAX_PROGRAMS = 4;

var DEVICE_TYPES = Object.freeze({
    TEMPERATURE: "Temperature",
    ILLUMINATIOn: "Illumination",
    CO2: "Co2",
    SWITCH: "Switch",
    CONTACT: "Contact",
    KEYCARD_SWITCH: "KeyCardSwitch",
    OCCUPANCY: "Occupancy",
    ON_OFF_ACTUATOR: "OnOffActuator",
    SMART_PLUG: "SmartPlug",
    COLORLIGHT: "ColorLight",
    DOMICUBE: "DomiCube"
});

var PICTOGRAM_IDS = Object.freeze({
    // common
    CONNECTION: 'connection',
    DISCONNECTION: 'disconnection',
    READ: 'read',
    WRITE: 'write',
    USER: 'user',
    // temperature
    TEMPERATURE_TYPE: 'temperature_type',
    // switch
    SWITCH_TYPE: 'switch_type',
    SWITCH_STATE_1: 'switch_state_1',
    SWITCH_STATE_3: 'switch_state_3',
    SWITCH_STATE_5: 'switch_state_5',
    SWITCH_STATE_7: 'switch_state_7',
    // contact
    CONTACT_TYPE: 'contact_type',
    CONTACT_STATE_ON: 'contact_state_on',
    CONTACT_STATE_OFF: 'contact_state_off',
    // keycard
    KEYCARDSWITCH_TYPE: 'keycardswitch_type',
    KEYCARDSWITCH_STATE_IN: 'keycardswitch_state_in',
    KEYCARDSWITCH_STATE_OUT: 'keycardswitch_state_out',
    // colorlight
    COLORLIGHT_TYPE: 'colorlight_type',
    COLORLIGHT_STATE_ON: 'colorlight_state_on',
    COLORLIGHT_STATE_OFF: 'colorlight_state_off'
});

var DEVICE_STATUS = Object.freeze({
    DISCONNECTED: 0,
    PROBLEM: 1,
    CONNECTED: 2
});

var EVENT_TYPES = Object.freeze({
    APPEAR: "appear",
    CONNECTION: "connection",
    UPDATE: "update",
    DISCONNECTION: "disconnection",
    DISAPPEAR: "disappear"
});

var CAUSALITY_TYPE = Object.freeze({
    TECHNICAL: "technical",
    ENVIRONMENTAL: "environmental",
    USER: "user",
    PROGRAM: "program"
});

var PROGRAM_STATE = Object.freeze({
    INVALID: "invalid",
    DISABLED: "disabled",
    ENABLED: "enabled"
});

var MIN_WAIT = 1000;
var REPLAY_SPEED = 1;

// helpers
function not(thing) {
    return !thing;
}

// requirements
var fs = require('fs');
var _ = require('lodash');
var docopt = require('docopt').docopt;
var colors = require('colors');
colors.setTheme({
    timestamp: 'yellow',
    info: 'blue',
    error: 'red'
});

// parse arguments
var doc = '' +
    'Usage:\n' +
    '   server.js [options]\n\n' +
    'Options:\n' +
    '   --data=<filename>   read data from a file\n' +
    '   --socket=<socket>   select socket implementation [default: ws]\n' +
    '   --speed=<speed>     change output speed [default: 1]\n' +
    '   --port=<port>       set socket port [default: 3000]\n' +
    '   --stream=<stream>   enable or disable live streaming [default: true]\n' +
    '   --dump=<filename>   dump output to filename\n' +
    '   --help              show this help and exit\n' +
    '   --version           show version and exit\n';

var options = docopt(doc, {version: '0.3'});
REPLAY_SPEED = Math.max(options['--speed'], 1);

// hand check data
var hand_check_data = "hello world!"

process.stdout.write('\nStart server\n');

// define socket implementation
var io = null;
if (options['--socket'] == 'socket.io') {
    process.stdout.write('\nUsing Socket.io implementation for WebSocket.\n'.underline);
    io = require('socket.io').listen(options['--port']).sockets;
    _.extend(io, {
        broadcast: function (data) {
            this.send(data);
        }
    });
} else {
    process.stdout.write('\nUsing WS implementation for WebSocket.\n'.underline);
    var WebSocketServer = require('ws').Server;
    io = new WebSocketServer({host: "localhost", port: options['--port']});
    _.extend(io, {
        broadcast: function (data) {
            for (var i in this.clients) {
                this.clients[i].send(data);
            }
        }
    });
}

// define writer if required
var writer = null;
if (options['--dump']) {
    writer = fs.createWriteStream(options['--dump']);
    writer.write('[');
}

/**
 * Generate a decoration.
 *
 * @param order Order in which this decoration should be processed
 * @param type Type of decoration (i.e. pictogram id)
 * @param causality
 * @param description
 * @returns {*} A decoration
 */
decoration_factory = function (order, type, causality, description) {
    return {
        order: order,
        type: type,
        causality: causality || null,
        description: description || "No description"
    }
};

/**
 * Generate device frame data.
 *
 * @param id
 * @param type
 * @param last
 * @returns {*}
 */
device_factory = function (time, id, type, last) {
    var minutes = new Date(time).getMinutes();
    var decorationCount = 0;

    // is this an initialization ?
    var initialization = _.isUndefined(last);

    // don't do any change 80% of the time
    if (not(initialization) && Math.random() > 0.1) {
        return last;
    }

    // define `type` if not defined
    type = type || _.sample([
        DEVICE_TYPES.TEMPERATURE,
        DEVICE_TYPES.SWITCH,
        DEVICE_TYPES.CONTACT,
        DEVICE_TYPES.COLORLIGHT,
        DEVICE_TYPES.KEYCARD_SWITCH
    ]);

    // define `last` if not defined
    last = last || {
        id: id,
        name: "" + type + "" + id,
        type: type,
        event: {
            type: EVENT_TYPES.APPEAR
        },
        decorations: []
    };

    // prepare next event
    var next = {
        id: id,
        name: "" + type + "" + id,
        type: type,
        event: last.event || {},
        decorations: []
    };

    if (last.event.type === EVENT_TYPES.APPEAR && not(initialization)) {
        // mark it as CONNECTION if previous event was APPEAR
        next.event.type = EVENT_TYPES.CONNECTION;
    } else if (last.event.type === EVENT_TYPES.CONNECTION && not(initialization)) {
        // mark it as UPDATE if previous event was CONNECTION
        next.event.type = EVENT_TYPES.UPDATE;
    } else if (Math.random() > 0.98) {
        // else make it appear/disappear 2% of the time
        if (last.event.type === EVENT_TYPES.UPDATE) {
            next.event.type = _.sample([EVENT_TYPES.DISAPPEAR, EVENT_TYPES.APPEAR]);
        } else {
            next.event.type = (last.event.type === EVENT_TYPES.APPEAR ? EVENT_TYPES.DISAPPEAR : EVENT_TYPES.APPEAR);
        }
    }

    // return in case the device appears or disappears
    if (next.event.type === EVENT_TYPES.DISAPPEAR) {
        if (last.event.type === EVENT_TYPES.DISAPPEAR) {
            // if last was already gone then return last
            return last;
        } else {
            // else it is a new state, so return it
            return next;
        }
    } else if (next.event.type === EVENT_TYPES.APPEAR) {
        if (last.event.type === EVENT_TYPES.APPEAR) {
            // if last was already in that state then return last
            return last;
        } else {
            // else it is a new state, so return it
            return next;
        }
    }

    // update status 5% of the time or if last event's state is empty
    if (Math.random() > 0.95 || _.isEmpty(last.event.state)) {
        // here we don't handle the status "PROBLEM" but only CONNECTED or DISCONNECTED
        if (next.event.type === EVENT_TYPES.CONNECTION) {
            // if this is a connection then setup the status as connected
            // we end up in this case when last was an APPEAR event.
            next.event.state = {
                status: DEVICE_STATUS.CONNECTED
            };
        } else if (last.event.state && last.event.state.status) {
            next.event.state.status = (last.event.state.status === DEVICE_STATUS.DISCONNECTED ? DEVICE_STATUS.CONNECTED : DEVICE_STATUS.DISCONNECTED);
        } else {
            next.event.state.status = _.sample([DEVICE_STATUS.DISCONNECTED, DEVICE_STATUS.CONNECTED]);
        }

        // add decoration
        next.decorations.push(
            decoration_factory(
                decorationCount++,
                    next.event.state.status === DEVICE_STATUS.DISCONNECTED ? PICTOGRAM_IDS.DISCONNECTION : PICTOGRAM_IDS.CONNECTION,
                null,
                null
            )
        );

        // set event type
        next.event.type = next.event.state.status === DEVICE_STATUS.DISCONNECTED ? EVENT_TYPES.DISCONNECTION : EVENT_TYPES.CONNECTION;
    } else if (last.event.type === EVENT_TYPES.DISCONNECTION) {
        // return last in case last was a disconnection since it has not change
        return last;
    }

    // perform the update
    switch (type) {
        case DEVICE_TYPES.TEMPERATURE:
            // update state
            if (next.event.type === EVENT_TYPES.UPDATE) {
                var last_temperature = last.event.state && last.event.state.value || 20;
                next.event.state.value = Math.random() > 0.8 ? last_temperature : last_temperature + Math.random() - 0.5;
            } else {
                next.event.state.value = 0;
            }
            // set event pictogram
            next.event.picto = PICTOGRAM_IDS.TEMPERATURE_TYPE;
            break;
        case DEVICE_TYPES.SWITCH:
            // update state
            if (next.event.type === EVENT_TYPES.UPDATE) {
                next.event.state.switchNumber = _.sample([1, 3, 5, 7]);

                // set event pictogram
                switch (next.event.state.switchNumber) {
                    case 1:
                        next.event.picto = PICTOGRAM_IDS.SWITCH_STATE_1;
                        break;
                    case 3:
                        next.event.picto = PICTOGRAM_IDS.SWITCH_STATE_3;
                        break;
                    case 5:
                        next.event.picto = PICTOGRAM_IDS.SWITCH_STATE_5;
                        break;
                    case 7:
                        next.event.picto = PICTOGRAM_IDS.SWITCH_STATE_7;
                        break;
                    default:
                        next.event.picto = PICTOGRAM_IDS.SWITCH_TYPE;
                        break;
                }
            } else {
                next.event.picto = PICTOGRAM_IDS.SWITCH_TYPE;
            }

            break;
        case DEVICE_TYPES.CONTACT:
            // update state
            if (next.event.type === EVENT_TYPES.UPDATE) {
                var state = next.event.state.value = _.sample(['true', 'false']);
                // update event pictogram
                next.event.picto = state === 'true' ? PICTOGRAM_IDS.CONTACT_STATE_ON : PICTOGRAM_IDS.CONTACT_STATE_OFF;
            } else {
                // update event pictogram
                next.event.picto = PICTOGRAM_IDS.CONTACT_TYPE;
            }
            break;
        case DEVICE_TYPES.KEYCARD_SWITCH:
            // update state
            if (next.event.type === EVENT_TYPES.UPDATE) {
                var state = next.event.state.state = _.sample(['true', 'false']);
                // update event pictogram
                next.event.picto = state === 'true' ? PICTOGRAM_IDS.KEYCARDSWITCH_STATE_IN : PICTOGRAM_IDS.KEYCARDSWITCH_STATE_OUT;
            } else {
                // update event pictogram
                next.event.picto = PICTOGRAM_IDS.KEYCARD_SWITCH;
            }
            break;
        case DEVICE_TYPES.COLORLIGHT:
            // update state
            if (next.event.type === EVENT_TYPES.UPDATE) {
                var state = next.event.state.state = _.sample(['true', 'false']);
                // update event pictogram
                next.event.picto = state === 'true' ? PICTOGRAM_IDS.COLORLIGHT_STATE_ON : PICTOGRAM_IDS.COLORLIGHT_STATE_OFF;
            } else {
                // update event pictogram
                next.event.picto = PICTOGRAM_IDS.COLORLIGHT;
            }
            break;
    }

    // @todo we need a deep comparison here in case we generated the same exact state :/
    // in this case we must return `last` instead of `next`.

    return next;
};

/**
 * Generate program frame data.
 *
 * @param id
 * @param last
 * @returns {*}
 */
program_factory = function (time, id, last) {
    var minutes = new Date(time).getMinutes();

    if (last !== undefined && Math.random() < 0.8) {
        return last;
    }

    // define *type* and *last* if not defined
    var setup = (last === undefined);

    // define `last` if not defined
    last = last || {
        id: id,
        name: 'Program' + id,
        event: {
            type: EVENT_TYPES.UPDATE,
            state: {
                name: PROGRAM_STATE.DISABLED
            }
        },
        decorations: []
    };

    // prepare next event
    var next = {
        id: id,
        name: 'Program' + id,
        event: last.event || {},
        decorations: []
    };

    if (last.event.type === EVENT_TYPES.APPEAR && not(initialization)) {
        // mark it as UPDATE if previous event was APPEAR
        next.event.type = EVENT_TYPES.UPDATE;
    } else if (Math.random() > 0.98) {
        // else make it appear/disappear 2% of the time
        if (last.event.type === EVENT_TYPES.UPDATE) {
            next.event.type = _.sample([EVENT_TYPES.DISAPPEAR, EVENT_TYPES.APPEAR]);
        } else {
            next.event.type = (last.event.type === EVENT_TYPES.APPEAR ? EVENT_TYPES.DISAPPEAR : EVENT_TYPES.APPEAR);
        }
    }

    // return in case the device appears or disappears
    if (next.event.type === EVENT_TYPES.DISAPPEAR) {
        if (last.event.type === EVENT_TYPES.DISAPPEAR) {
            // if last was already gone then return last
            return last;
        } else {
            // else it is a new state, so return it
            return next;
        }
    } else if (next.event.type === EVENT_TYPES.APPEAR) {
        if (last.event.type === EVENT_TYPES.APPEAR) {
            // if last was already in that state then return last
            return last;
        } else {
            // else it is a new state, so return it
            return next;
        }
    }

    // update state
    if (Math.random() > 0.95) {
        next.event.state.name = PROGRAM_STATE.INVALID;
    } else {
        var change = Math.random();
        if (change > 0.9) {
            next.event.state.name = PROGRAM_STATE.DISABLED;
        } else {
            next.event.state.name = PROGRAM_STATE.ENABLED;
        }
    }

    // @todo we need a deep comparison here
    // return last if no change in state

    return next;
};

/**
 * Stream data
 *
 * @param data
 */
stream = function (data) {
    if (data.length == 0) return;

    // get the frame to stream
    var frame = data.shift();

    // update console
    process.stdout.write(
            ('[' + frame.timestamp + '] ').timestamp +
            (' ' + _.size(frame._devices) + ' device update(s), ').info +
            (' ' + _.size(frame.programs) + ' program update(s)').info + '\n'
    );

    var trace = JSON.stringify(frame);

    // stream it
    io.broadcast(trace);

    // dump it
    if (options['--dump']) {
        writer.write((frameSent < 1 ? '' : ',') + trace);
    }

    frameSent++;

    if (data.length > 0) {
        delay = (data[0].timestamp - frame.timestamp) / REPLAY_SPEED;
        setTimeout(
            function (data) {
                stream(data)
            },
            delay, data
        );
    }
};

if (options['--data']) {
    fs.readFile(options['--data'], {encoding: 'utf-8'}, function (err, data) {
        if (!err) {
            hand_check_data = data;
        } else {
            process.stderr.write(('\nUnable to parse file ' + options['--data']).error);
            process.exit();
        }
    });
} else {
    var clock = MIN_WAIT / REPLAY_SPEED;
    var nextUpdate = new Date().getTime();

    // stream data
    var generate = function () {
        // time start now
        var time = new Date().getTime();

        var devices_updates = {};
        var programs_updates = {};

        if (devices == null) {
            devices = {};
            for (var i = 0; i < MAX_DEVICES; i++) {
                device_count++;
                devices[i] = device_factory(time, i);
            }
            devices_updates = devices;
        } else if (nextUpdate < time) {
            devices = _.map(devices, function (d) {
                var next = device_factory(time, d.id, d.type, d);
                if (next != d) {
                    devices_updates[d.id] = d;
                }
                return next;
            });
        }

        if (programs == null) {
            programs = {};
            for (i = 0; i < MAX_PROGRAMS; i++) {
                program_count++;
                programs[i] = program_factory(time, i);
            }
            programs_updates = programs;
        } else if (nextUpdate < time) {
            programs = _.map(programs, function (p) {
                var next = program_factory(time, p.id, p);
                if (next != p) {
                    programs_updates[p.id] = p;
                }
                return next;
            });
        }

        // update console
        if (_.isEmpty(devices_updates) && _.isEmpty(programs_updates)) {
            process.stdout.write(
                    ('[' + time + ']').timestamp +
                    ' no data sent' + '\n'
            );
        } else {
            process.stdout.write(
                    ('[' + time + '] ').timestamp +
                    (' ' + _.size(devices_updates) + ' device update(s), ').info +
                    (' ' + _.size(programs_updates) + ' program update(s)').info + '\n'
            );
        }

        var trace = JSON.stringify({
            timestamp: time,
            devices: devices_updates,
            programs: programs_updates
        });

        // send it
        io.broadcast(trace);

        // dump it
        if (options['--dump']) {
            writer.write((frameSent < 1 ? '' : ',') + trace);
        }

        frameSent++;

        // loop
        if (nextUpdate < time && Math.random() > 0.8) {
            nextUpdate = time + clock * 10 * (1 + Math.random() * 9);
        } else if (nextUpdate < time) {
            nextUpdate = time + clock;
        }

        setTimeout(generate, clock);
    };

    generate();
}


// say hi on connection
io.on('connection', function (socket) {
    process.stdout.write("\nNew client connection.\n");
    socket.send(hand_check_data);
});

// quit gracefully
process.on('SIGINT', function () {
    process.stdout.write("\nGracefully shutting down (Ctrl-C)");
    if (options['--dump']) {
        writer.write(']');
    }
    process.exit();
});