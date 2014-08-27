// AppsGateDebugger (AppsGate.Debugger)
// ----------------------------------
// v0.0.1
//
// Copyright (c)2014 Rémi Barraquand.
// Distributed under ISC license

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['backbone', 'jquery', 'underscore', 'd3'], function(Backbone, $, _, d3) {
            return (root.AppsGateDebugger = factory(root, Backbone, $, _, d3));
        });
    } else {
        // Browser globals
        root.AppsGateDebugger = factory(root, root.Backbone, root.$, root._, root.d3);
    }
}(this, function(root, Backbone, $, _, d3) {
    'use strict';

    var previousDebugger = root.AppsGateDebugger;

    var Debugger = {};

    Debugger.VERSION = '0.0.1';

    Debugger.noConflict = function() {
        root.AppsGateDebugger = previousDebugger;
        return this;
    };

    // borrow Backbone.extend;
    Debugger.extend = Backbone.Model.extend;

    var BASE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><defs><g id="colorlight_state_off"><g transform="matrix(.18519 0 0 .18519-12.778-148.7)"><path fill="#f9f9f9" d="m122 847c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34"/><path d="m122 847c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/></g><path opacity=".62" fill="#fff" d="m5.88 6.185l.018-.796c.127-.099.243-.219.338-.36.47-.7.291-1.644-.399-2.107-.69-.463-1.631-.27-2.101.431-.47.7-.292 1.644.399 2.106.005.003.011.006.015.009l-.015.703 1.745.014"/><path fill="#605f5f" d="m99.52 841.39l-7.371.059c-.416.003-.621-.284-.625-.616-.002-.331.199-.621.615-.624l7.371-.059c.418-.003.621.285.625.616.002.331-.197.622-.615.624m-3.719-22.08c4.9-.038 8.889 3.89 8.928 8.772.02 2.494-1.01 4.769-2.666 6.389-.518.634-.82 1.44-.902 3.714-.021.548-.422.803-.848.787s-.807-.3-.787-.848c.09-2.408.441-3.695 1.342-4.768 1.365-1.322 2.242-3.213 2.225-5.262-.029-3.98-3.281-7.182-7.281-7.15-3.98.031-7.18 3.283-7.15 7.264.018 2.047.922 3.924 2.307 5.225.918 1.059 1.291 2.34 1.416 4.747.029.547-.348.837-.773.858-.424.023-.83-.227-.857-.772-.119-2.272-.434-3.073-.961-3.699-1.684-1.595-2.746-3.853-2.766-6.347-.04-4.882 3.89-8.871 8.773-8.91m3.734 24.12l-7.371.058c-.416.003-.621-.283-.625-.615-.002-.331.199-.622.615-.625l7.371-.057c.418-.004.621.282.625.614.002.332-.197.623-.615.625m-.781 2.045l-5.777.046c-.418.003-.621-.284-.625-.615-.002-.332.197-.622.615-.626l5.779-.044c.416-.003.621.283.623.614.004.333-.197.623-.615.625m-.877.843c-.305.67-1.088 1.149-2.01 1.156-.922.008-1.713-.46-2.027-1.125l4.03-.031" transform="matrix(.18519 0 0 .18519-12.778-148.7)"/><path stroke-width=".37" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m1.111 1.481h1.296"/></g><g id="colorlight_state_on"><g transform="matrix(.18519 0 0 .18519-24.26-148.7)"><path fill="#f9f9f9" d="m184 847c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34"/><path d="m184 847c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path fill="#605f5f" d="m161.76 841.62l-7.371.059c-.416.003-.621-.284-.625-.616-.002-.331.199-.621.615-.624l7.371-.059c.418-.003.621.285.625.616.002.331-.197.622-.615.624m-3.719-22.08c4.9-.038 8.889 3.89 8.928 8.772.02 2.494-1.01 4.769-2.666 6.389-.518.634-.82 1.44-.902 3.714-.021.548-.422.803-.848.787s-.807-.3-.787-.848c.09-2.408.441-3.695 1.342-4.768 1.365-1.322 2.242-3.213 2.225-5.262-.029-3.98-3.281-7.182-7.281-7.15-3.98.031-7.18 3.283-7.15 7.264.018 2.047.922 3.924 2.307 5.225.918 1.059 1.291 2.34 1.416 4.747.029.547-.348.837-.773.858-.424.023-.83-.227-.857-.772-.119-2.272-.434-3.073-.961-3.699-1.684-1.595-2.746-3.853-2.766-6.347-.039-4.883 3.89-8.871 8.773-8.91m3.734 24.11l-7.371.058c-.416.003-.621-.283-.625-.615-.002-.331.199-.622.615-.625l7.371-.057c.418-.004.621.282.625.614.003.332-.197.623-.615.625m-.781 2.045l-5.777.046c-.418.003-.621-.284-.625-.615-.002-.332.197-.622.615-.626l5.779-.044c.416-.003.621.283.623.614.004.333-.197.623-.615.625m-.877.844c-.305.67-1.088 1.149-2.01 1.156-.922.008-1.713-.46-2.027-1.125l4.03-.031"/><circle cy="815.73" cx="142.73" r="6.397" fill="#f8c500"/></g></g><g id="colorlight_type"><path opacity=".62" fill="#fff" d="m5.88 6.185l.018-.796c.127-.099.243-.219.338-.36.47-.7.291-1.644-.399-2.107-.69-.463-1.631-.27-2.101.431-.47.7-.292 1.644.399 2.106.005.003.011.006.015.009l-.015.703 1.745.014"/><path fill="#605f5f" d="m99.52 841.39l-7.371.059c-.416.003-.621-.284-.625-.616-.002-.331.199-.621.615-.624l7.371-.059c.418-.003.621.285.625.616.002.331-.197.622-.615.624m-3.719-22.08c4.9-.038 8.889 3.89 8.928 8.772.02 2.494-1.01 4.769-2.666 6.389-.518.634-.82 1.44-.902 3.714-.021.548-.422.803-.848.787s-.807-.3-.787-.848c.09-2.408.441-3.695 1.342-4.768 1.365-1.322 2.242-3.213 2.225-5.262-.029-3.98-3.281-7.182-7.281-7.15-3.98.031-7.18 3.283-7.15 7.264.018 2.047.922 3.924 2.307 5.225.918 1.059 1.291 2.34 1.416 4.747.029.547-.348.837-.773.858-.424.023-.83-.227-.857-.772-.119-2.272-.434-3.073-.961-3.699-1.684-1.595-2.746-3.853-2.766-6.347-.04-4.882 3.89-8.871 8.773-8.91m3.734 24.12l-7.371.058c-.416.003-.621-.283-.625-.615-.002-.331.199-.622.615-.625l7.371-.057c.418-.004.621.282.625.614.002.332-.197.623-.615.625m-.781 2.045l-5.777.046c-.418.003-.621-.284-.625-.615-.002-.332.197-.622.615-.626l5.779-.044c.416-.003.621.283.623.614.004.333-.197.623-.615.625m-.877.843c-.305.67-1.088 1.149-2.01 1.156-.922.008-1.713-.46-2.027-1.125l4.03-.031" transform="matrix(.18519 0 0 .18519-12.778-148.7)"/></g><g id="connection"><path d="m8.112 1.587c-.163-.205-.459-.239-.664-.077l-1.506 1.195-.736-.929c-.051-.065-.157-.077-.222-.026l-1.435 1.138c-1.219.967-1.559 2.624-.906 3.966l-2.374 1.883c-.307.244-.359.687-.115.995.244.307.687.358.995.115l2.374-1.883c1.158.941 2.85.987 4.068.021l1.435-1.138c.065-.051.077-.157.026-.222l-.736-.928 1.506-1.195c.205-.163.239-.459.077-.664-.163-.205-.459-.239-.664-.077l-1.506 1.195-1.198-1.511 1.506-1.195c.205-.163.239-.459.077-.664" fill="#008000"/></g><g id="contact_state_off"><g transform="matrix(.16949 0 0 .16949-63.898-41.36)"><path d="m435 293c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39" fill="#f9f9f9"/><path d="m435 293c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m429 286.16c0 1.56-1.275 2.835-2.835 2.835h-37.33c-1.56 0-2.835-1.275-2.835-2.835v-5.33c0-1.56 1.275-2.835 2.835-2.835h37.33c1.56 0 2.835 1.275 2.835 2.835v5.33" fill="#a0a0a0"/></g><path transform="matrix(.94274.33352-.33352.94274 0 0)" fill="#a0a0a0" d="m5.238.645h2.203v.508h-2.203z"/></g><g id="contact_state_on"><g transform="matrix(.16949 0 0 .16949-10.508-40.847)"><path fill="#f9f9f9" d="m120 290c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39"/><path d="m120 290c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path fill="#a0a0a0" d="m114 281.16c0 1.56-1.275 2.835-2.835 2.835h-37.32c-1.56 0-2.835-1.28-2.835-2.84v-5.33c0-1.55 1.275-2.83 2.835-2.83h37.33c1.56 0 2.835 1.275 2.835 2.835v5.33z"/></g><path fill="#a0a0a0" d="m3.898 4.746h2.203v.508h-2.203z"/></g><g id="contact_type"><g fill="#a0a0a0"><path d="m114 281.16c0 1.56-1.275 2.835-2.835 2.835h-37.33c-1.56 0-2.835-1.28-2.835-2.84v-5.33c0-1.55 1.275-2.83 2.835-2.83h37.33c1.56 0 2.835 1.275 2.835 2.835v5.33" transform="matrix(.16949 0 0 .16949-10.508-40.847)"/><path d="m3.898 4.746h2.203v.508h-2.203z"/></g></g><g id="disconnection"><path d="m8.112 1.587c-.163-.205-.459-.239-.664-.077l-1.506 1.195-.736-.929c-.051-.065-.157-.077-.222-.026l-1.435 1.138c-1.219.967-1.559 2.624-.906 3.966l-2.374 1.883c-.307.244-.359.687-.115.995.244.307.687.358.995.115l2.374-1.883c1.158.941 2.85.987 4.068.021l1.435-1.138c.065-.051.077-.157.026-.222l-.736-.928 1.506-1.195c.205-.163.239-.459.077-.664-.163-.205-.459-.239-.664-.077l-1.506 1.195-1.198-1.511 1.506-1.195c.205-.163.239-.459.077-.664" fill="#f00"/></g><g id="keycardswitch_state_in"><g transform="matrix(.17857 0 0 .17857-40-57.679)"><path fill="#f9f9f9" d="m279 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36"/><path d="m279 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/></g><g transform="matrix(.17857 0 0 .17857-40-57.679)"><path opacity=".31" fill="#bf9100" d="m260.42 350h-17.42v-7.13z"/><path stroke-width="2" stroke="#f9f9f9" stroke-miterlimit="10" fill="none" d="m252 353v14"/><path fill="#f9f9f9" d="m255 366.36l-3 3.39-3-3.39v-2.88l3 3.39 3-3.39z"/></g><path fill="#333" d="m2.679 3.929h4.464v5h-4.464z"/><path transform="matrix(.17857 0 0 .17857-40-57.679)" stroke="#cecece" stroke-miterlimit="10" fill="none" d="m240.38 346.17l1.95 3.33h19.67l1.27-3.36"/><path fill="#f8c500" d="m3.393 3.571h3.214v1.25h-3.214z"/></g><g id="keycardswitch_state_out"><g transform="matrix(.17857 0 0 .17857-11.607-57.679)"><path fill="#f9f9f9" d="m120 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36"/><path d="m120 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/></g><path fill="#333" d="m2.857 3.929h4.286v5h-4.286z"/><path transform="matrix(.17857 0 0 .17857-11.607-57.679)" stroke="#cecece" stroke-miterlimit="10" fill="none" d="m81.43 346.14l1.95 3.36h19.72l1.27-3.38"/><path fill="#f8c500" d="m3.571.893h2.857v3.75h-2.857z"/><path opacity=".31" transform="matrix(.17857 0 0 .17857-11.607-57.679)" fill="#bf9100" d="M85 328.22 101.51 349 85 349z"/></g><g id="keycardswitch_type"><g fill="#666"><path d="m2.857 3.929h4.286v5h-4.286z"/><path transform="matrix(.17857 0 0 .17857-11.607-57.679)" stroke="#cecece" stroke-miterlimit="10" d="m81.43 346.14l1.95 3.36h19.72l1.27-3.38"/></g><path fill="#999" d="m3.571.893h2.857v3.75h-2.857z"/><path opacity=".31" transform="matrix(.17857 0 0 .17857-11.607-57.679)" fill="#666" d="M85 328.22 101.51 349 85 349z"/></g><g id="magnify"><g transform="matrix(0.06304604,0,0,0.06335409,4.45048e-6,-0.15735514)" id="g4"><path d="m 67.37,66.43 c -3.964,3.973 -3.972,10.405 0,14.369 l 73.899,73.903 c 3.971,3.964 10.401,3.964 14.373,0 3.963,-3.972 3.963,-10.412 0,-14.376 L 81.739,66.437 c -1.981,-1.984 -4.58,-2.976 -7.18,-2.976 -2.6,0 -5.201,0.992 -7.188,2.976 z" id="path6"/><path d="m 5.804,55.611 c 0,27.609 22.377,49.992 49.981,49.992 27.597,0 49.98,-22.383 49.98,-49.992 C 105.765,28.016 83.388,5.642 55.79,5.642 28.186,5.642 5.809,28.016 5.809,55.614 z" id="path14" style="fill:#00ffff"/><path d="m 55.891,16.495 c 9.06,0 17.537,1.599 24.78,4.372 -6.461,-5.217 -15.177,-8.424 -24.78,-8.424 -9.603,0 -18.321,3.207 -24.781,8.424 7.243,-2.773 15.717,-4.372 24.781,-4.372" id="path16" style="fill:#ffffff"/><path d="m 76.75,51.43 v 7.932 H 60.282 v 16.771 h -8.64 V 59.362 H 35.174 V 51.43 H 51.642 V 34.561 h 8.64 V 51.43 H 76.75" id="path18" style="fill:#1a1a1a"/><g id="g8" style="fill:#666666"><path d="m 86.16,99.58 14.09,14.1 14.37,-14.369 -14.1,-14.09 -14.364,14.368" id="path10"/><path d="m 0,55.829 c 0,30.93 25.07,56.01 56,56.01 30.924,0 55.998,-25.08 55.998,-56.01 C 111.998,24.909 86.928,-0.168 56,-0.168 25.07,-0.173 0,24.902 0,55.824 z" id="path12"/></g></g></g><g id="program"><g transform="matrix(.10837 0 0 .1001-.418.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g></g><g id="programe"><g transform="matrix(.10837 0 0 .1001-.418.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g></g><g id="read"><g transform="matrix(.10837 0 0 .1001.442.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g><path d="m4.605 7.172v-.697h-2.271-2.271v-1.17-1.17h2.271 2.271l.004-.695.004-.695 1.549 1.279c1.197.989 1.34 1.151 1.528 1.306-.024.032-3.061 2.539-3.076 2.539-.005 0-.01-.314-.01-.697z" stroke="#0000bf" stroke-width=".045" fill="#3a88ff"/></g><g id="switch_state_1"><g transform="matrix(.17857 0 0 .17857-63.75-86.79)"><path d="m412 532c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m412 532c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m401 532c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-27c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v27" fill="#a0a0a0"/></g><g opacity=".09"><path d="m401 532c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-21c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v21" fill="#fff" transform="matrix(.17857 0 0 .17857-63.75-86.79)"/></g><g fill="#f9f9f9"><path d="m3.036 3.393h2.143v4.821h-2.143z"/><path d="m5.179 3.393h1.786v4.821h-1.786z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-63.75-86.79)"><path d="m382.69 497.91c1.525-1.525 3.999-1.524 5.524.001"/><path d="m383.94 499.45c.814-.813 2.132-.812 2.945.001"/><path d="m380.94 495.95c2.336-2.336 6.182-2.276 8.59.133"/></g><path fill="#fff" d="m3.036 3.393h1.964v4.821h-1.964z"/><path fill="#1e1e1e" d="m5 3.393h1.964v4.821h-1.964z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m5.089 3.393v4.821"/><path fill="#f8c500" d="m3.214 3.571h1.607v1.786h-1.607z"/></g><g id="switch_state_3"><g transform="matrix(.17857 0 0 .17857-89.29-87.32)"><path d="m555 535c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m555 535c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m543 534c0 1.104-.896 2-2 2h-27c-1.104 0-2-.896-2-2v-25c0-1.104.896-2 2-2h27c1.104 0 2 .896 2 2v25" fill="#a0a0a0"/></g><g opacity=".09"><path d="m543 534c0 1.104-.896 2-2 2h-27c-1.104 0-2-.896-2-2v-19c0-1.104.896-2 2-2h27c1.104 0 2 .896 2 2v19" fill="#fff" transform="matrix(.17857 0 0 .17857-89.29-87.32)"/></g><g fill="#f9f9f9"><path d="m2.857 3.75h2.143v4.286h-2.143z"/><path d="m5 3.75h1.964v4.286h-1.964z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-89.29-87.32)"><path d="m524.6 501.88c1.462-1.463 3.833-1.462 5.294.001"/><path d="m525.79 503.36c.779-.779 2.042-.778 2.821.001"/><path d="m522.92 500.01c2.238-2.239 5.923-2.182 8.231.126"/></g><path fill="#fff" d="m2.857 3.75h1.964v4.286h-1.964z"/><path fill="#1e1e1e" d="m4.821 3.75h2.143v4.286h-2.143z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m4.911 3.75v4.286"/><path fill="#f8c500" d="m3.036 6.071h1.607v1.786h-1.607z"/></g><g id="switch_state_5"><g transform="matrix(.17857 0 0 .17857-36.964-86.25)"><path d="m262 529c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m262 529c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m251 528c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-26c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v26" fill="#a0a0a0"/></g><g opacity=".09"><path d="m251 528c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-20c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v20" fill="#fff" transform="matrix(.17857 0 0 .17857-36.964-86.25)"/></g><g fill="#f9f9f9"><path d="m3.036 3.393h1.964v4.464h-1.964z"/><path d="m5 3.393h1.964v4.464h-1.964z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-36.964-86.25)"><path d="m232.65 495.86c1.507-1.507 3.951-1.506 5.457.001"/><path d="m233.88 497.39c.804-.804 2.105-.803 2.909.001"/><path d="m230.92 493.93c2.308-2.307 6.106-2.248 8.485.131"/></g><path fill="#fff" d="m3.036 3.393h1.964v4.464h-1.964z"/><path fill="#1e1e1e" d="m5 3.393h1.964v4.464h-1.964z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m5.089 3.393v4.464"/><path fill="#f8c500" d="m5.357 3.571h1.429v1.964h-1.429z"/></g><g id="switch_state_7"><g transform="matrix(.17857 0 0 .17857-65.36-101.43)"><path d="m421 614c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m421 614c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m409 611c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-26c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v26" fill="#a0a0a0"/></g><g opacity=".09"><path d="m409 611c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-20c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v20" fill="#fff" transform="matrix(.17857 0 0 .17857-65.36-101.43)"/></g><g fill="#f9f9f9"><path d="m2.857 3.036h2.143v4.643h-2.143z"/><path d="m5 3.036h1.964v4.643h-1.964z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-65.36-101.43)"><path d="m390.3 577.68c1.801-1.8 4.721-1.799 6.521.001"/><path d="m391.77 579.51c.96-.96 2.515-.96 3.476.001"/><path d="m388.23 575.37c2.756-2.757 7.296-2.687 10.139.156"/></g><path fill="#fff" d="m2.857 3.036h1.964v4.643h-1.964z"/><path fill="#1e1e1e" d="m4.821 3.036h2.143v4.643h-2.143z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m4.911 3.036v4.643"/><path fill="#f8c500" d="m5.179 5.357h1.429v2.143h-1.429z"/></g><g id="switch_type"><path d="m106 524c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-26c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v26" fill="#a0a0a0" transform="matrix(.17857 0 0 .17857-11.07-86.25)"/><path fill="#fff" d="m3.036 2.857h1.964v4.464h-1.964z"/><path fill="#1e1e1e" d="m5 2.857h1.964v4.464h-1.964z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m5.089 2.857v4.464"/><g opacity=".09"><path d="m106 524c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-20c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v20" fill="#fff" transform="matrix(.17857 0 0 .17857-11.07-86.25)"/></g><g fill="#f9f9f9"><path d="m3.036 2.857h2.143v4.464h-2.143z"/><path d="m5.179 2.857h1.786v4.464h-1.786z"/></g></g><g id="temperature_type"><path d="m5.806 5.457v-2.945c0-.395-.321-.716-.716-.716-.395 0-.716.321-.716.716v2.945c-.298.223-.477.573-.477.955 0 .658.535 1.194 1.194 1.194s1.194-.535 1.194-1.194c0-.381-.179-.732-.477-.955m-.716 1.83c-.483 0-.875-.392-.875-.875 0-.34.194-.635.477-.78v-3.12c0-.22.178-.398.398-.398s.398.178.398.398v3.12c.283.145.477.439.477.78 0 .483-.392.875-.875.875" fill="#605f5f"/></g><g id="user"><path d="m4.291 2.353c1.281 0 2.319-1.301 2.319-2.906 0-1.605-1.038-2.906-2.319-2.906s-2.319 1.301-2.319 2.906c0 1.605 1.038 2.906 2.319 2.906-2.647 0-4.814 1.847-5 4.188h10c-.186-2.341-2.353-4.188-5-4.188"/></g><g id="write"><g transform="matrix(.10837 0 0 .1001-1.279.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g><path d="m6.852 7.172v-.697h-2.271-2.271v-1.17-1.17h2.271 2.271l.004-.695.004-.695 1.549 1.279c1.197.989 1.34 1.151 1.528 1.306-.024.032-3.061 2.539-3.076 2.539-.005 0-.01-.314-.01-.697z" stroke="#0000bf" stroke-width=".045" fill="#3a88ff"/></g></defs></svg>';

    /**
     * Helpers
     */
    
    /**
     * Throw a *message* error.
     *
     * @param message
     * @param name
     */
    function throwError(message, args) {
        var error = new Error(_.template(message, args || {}, { interpolate: /\#\{(.+?)\}/g }));
        error.name = 'Error';
        throw error;
    }
    
    /**
     * Sluggify a *text*.
     *
     * This function replace space by - and remove all non ascii characters.
     *
     * @param text Text to sluggify.
     * @returns {string} Sluggified text.
     */
    function sluggify(text) {
        return String(text).toLowerCase().replace(RegExp(" ", "g"), "-").replace(/[^\w-]+/g, "")
    }
    
    /**
     * Ensure that some property is defined and not empty.
     *
     * If a `value` is provided as third arguments then it also check that the value
     * referred by propertyPath is equal to `value`.
     *
     * @param object Object to which this property belongs to
     * @param propertyPath Path to the property (e.g. some.property.name)
     * @returns {boolean}
     */
    function ensure(object, propertyPath) {
        var properties = propertyPath.split('.');
        while (properties.length) {
            var property = properties.shift();
            if (_.isObject(object) && object.hasOwnProperty(property) && !_.isEmpty(object[property])) {
                object = object[property];
            }
            else {
                return false;
            }
        }
    
        if (arguments.length == 2) {
            return true;
        } else {
            return object === _.last(arguments);
        }
    }
    
    /**
     * Check if object is missing some (sub)property.
     *
     * @param object Object from which this property should belongs to
     * @param propertyPath Path to the property (e.g. some.property.name)
     * @returns {boolean}
     */
    function missing(object, propertyPath) {
        return !ensure(object, propertyPath);
    }
    
    /**
     * Trigger an event and/or a corresponding method name.
     *
     * `this.triggerMethod('foo')` will trigger the 'foo' event and
     * call the 'onFoo' method.
     *
     * `this.triggerMethod('foo:bar')` will trigger the 'foo:bar' event and
     * call the 'onFooBar' method.
     *
     * @copyright Marionette.triggerMethod:
     */
    Debugger.triggerMethod = (function () {
    
        // split the event name on the ':'
        var splitter = /(^|:)(\w)/gi;
    
        // take the event section ('section1:section2:section3')
        // and turn it in to uppercase name
        function getEventName(match, prefix, eventName) {
            return eventName.toUpperCase();
        }
    
        // actual triggerMethod implementation
        var triggerMethod = function (event) {
            // get the method name from the event name
            var methodName = 'on' + event.replace(splitter, getEventName);
            var method = this[methodName];
            var result;
    
            // call the onMethodName if it exists
            if (_.isFunction(method)) {
                // pass all arguments, except the event name
                result = method.apply(this, _.tail(arguments));
            }
    
            // trigger the event, if a trigger method exists
            if (_.isFunction(this.trigger)) {
                this.trigger.apply(this, arguments);
            }
    
            return result;
        };
    
        return triggerMethod;
    })();
    
    Debugger.SmartBuffer = (function () {
    
        var SmartBuffer = function (options) {
            this.data = [];
            this.options = _.defaults({}, options, {
                pairing: false,
                shadowing: false,
                ignoreData: false
            });
        };
    
        _.extend(SmartBuffer.prototype, {
            concat: function (bulk) {
                //@todo optimize...
                var self = this;
                _.each(bulk, function (f) {
                    self.push.apply(self, f);
                });
            },
    
            push: function (timestamp, data) {
                // in case we just keep track of timestamp
                if (this.options.ignoreData) {
                    this.data.push({
                        timestamp: timestamp
                    });
                    return;
                }
    
                // return if not data and frame is undefined
                if (_.isEmpty(this.data) && _.isUndefined(data)) {
                    return;
                }
    
                if (this.options.pairing) {
                    if (!_.isUndefined(data) && _.isEmpty(this.data)) {
                        this.data.push({
                            timestamp: timestamp,
                            data: data,
                            next: {
                                timestamp: timestamp,
                                data: data
                            }
                        });
                    } else if (!_.isUndefined(data)) {
                        // replace previous shadow
                        this.data[this.size() - 1].next = {
                            timestamp: timestamp,
                            data: data
                        };
                        // push a new frame
                        this.data.push({
                            timestamp: timestamp,
                            data: data,
                            next: {
                                timestamp: timestamp,
                                data: data
                            }
                        });
                    } else {
                        // update shadow timestamp
                        this.data[this.size() - 1].next.timestamp = timestamp;
                    }
                } else {
                    if (!_.isUndefined(data) && this._lastIsShadow) {
                        // replace shadow by new frame
                        this.data[this.size() - 1] = {
                            timestamp: timestamp,
                            data: data
                        };
                        // last is not a shadow anymore
                        this._lastIsShadow = false;
                    } else if (_.isUndefined(data) && this._lastIsShadow) {
                        // update shadow timestamp
                        this.data[this.size() - 1].timestamp = timestamp;
                    } else if (!_.isUndefined(data)) {
                        // push new data
                        this.data.push({
                            timestamp: timestamp,
                            data: data
                        });
                    } else {
                        // push a shadow
                        this.data.push({
                            timestamp: timestamp,
                            data: this.data[this.size() - 1].data
                        });
                        // make last a shadow
                        this._lastIsShadow = true;
                    }
                }
            },
    
            all: function () {
                return this.data;
            },
    
            first: function() {
                return _.first(this.data);
            },
    
            last: function() {
                return _.last(this.data);
            },
    
            select: function (predicate) {
                return _.filter(this.data, predicate);
            },
    
            reject: function (predicate) {
                return _.reject(this.data, predicate);
            },
    
            domain: function (dateFn) {
                if (_.isUndefined(this.data)) return null;
    
                dateFn || (dateFn = function (d) {
                    return d;
                });
    
                var min = this.data[0];
                var max = _.max(this.data, function (d) {
                    return d.next ? d.next.timestamp : d.timestamp
                });
    
                return [dateFn(min.timestamp), dateFn(max.next ? max.next.timestamp : max.timestamp)];
            },
    
            /**
             * Return frame from buffered data that match a given `timestamp`.
             * @param timestamp Timestamp used to find the frame.
             * @returns {Object} the frame matching the timestamp or null if no match found.
             */
            at: function (timestamp) {
                // here we return the last frame that starts before `timestamp`.
                return _.findLast(this.data, function (frame) {
                    return frame.timestamp <= timestamp;
                });
            },
    
            size: function () {
                return this.data.length;
            }
        });
    
        return SmartBuffer;
    })();
    /**
     * Logger
     */
    
    var Logger = Debugger.Logger = (function () {
    
        function format(message, args) {
            return _.template(message, args || {}, { interpolate: /\#\{(.+?)\}/g });
        }
    
        var LoggerWrapper = function (logger) {
            this.__logger = logger || console;
        };
    
        _.extend(LoggerWrapper.prototype, _.object(_.map(['log', 'info', 'warn', 'debug', 'error'], function (method) {
            return [method, (function (method) {
                return function () {
                    var msg = format.apply(this, arguments);
                    if (_.isFunction(this.__logger[method])) {
                        this.__logger[method](msg);
                    }
                }
            })(method)];
        })));
    
        return LoggerWrapper;
    })();
    
    // Define default logger
    Debugger.logger = new Logger(console);
    /**
     * Event aggregator.
     */
    
    Debugger.Events = (function (Backbone, _) {
        'use strict';
    
        var Events = function () {
        };
    
        _.extend(Events.prototype, Backbone.Events);
    
        return Events;
    })(Backbone, _);
    
    // Allow the `Debugger` object to serve as a global event bus, for folks who
    // want global 'pubsub' in a convenient place.
    _.extend(Debugger, Backbone.Events);

    /**
     * Connector
     */
    
    Debugger.Connector = function (options) {
        // check supports for WebSocket
        if (!WebSocket) {
            throwError('WebSocket is not supported.');
        }
    
        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
    };
    
    _.extend(Debugger.Connector.prototype, Backbone.Events, {
        initialize: function (options) {
            var self = this;
    
            options = options || {};
    
            // set default options in case some is omitted
            this.options = _.defaults(options, {
                address: 'localhost',
                port: 8987,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 5000
            });
    
            this._connectionAttempted = 0;
    
            // goooo
            this._initiate_connection();
        },
    
        _initiate_connection: function () {
            var self = this;
    
            self._connectionAttempted++;
    
            // create socket
            this.socket = new WebSocket('ws://' + this.options.address + ':' + this.options.port);
    
            // bind to events
            _.extend(this.socket, {
                onopen: function (event) {
                    Debugger.logger.info('Socket opened on #{address}:#{port}', self.options);
                    Debugger.trigger('websocket:open');
                },
                onerror: function (event) {
                    Debugger.logger.info('Socket error.');
                    Debugger.trigger('websocket:error');
                },
                onclose: function (event) {
                    var code = event.code;
                    var reason = event.reason;
    
                    if (code != 1000) {
                        Debugger.logger.error('Socket closed unexpectedly #{reason}[code: #{code}]', {
                            code: code,
                            reason: reason ? reason + " " : ""
                        });
                    } else {
                        Debugger.logger.info('Socket closed.', {
                            code: code,
                            reason: reason
                        });
                    }
    
                    Debugger.trigger('websocket:close');
    
                    if (code != 1000 && self.isPersistent() && self.tryReconnection()) {
                        // notify user
                        Debugger.logger.info("Schedule socket reconnection in #{delay}ms (attempt n°#{attempts})", {
                                attempts: self._connectionAttempted,
                                delay: self.options.reconnectionDelay}
                        );
                        // reschedule connection
                        setTimeout(function () {
                            self._initiate_connection()
                        }, self.options.reconnectionDelay);
                    }
                },
                onmessage: function (message) {
                    var frame = JSON.parse(message.data);
                    self.trigger('frame:received', frame);
    
                    try {
    
                    } catch (e) {
                        throwError('Skip message "#{message}" due to error #{error}', {
                            message: message.data,
                            error: e
                        });
                    }
                }
            });
        },
    
        isPersistent: function () {
            return this.options.reconnection;
        },
    
        tryReconnection: function () {
            return this.options.reconnection && this._connectionAttempted < this.options.reconnectionAttempts;
        },
    
        // import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Debugger.triggerMethod,
    
        destroy: function () {
            var args = Array.prototype.slice.call(arguments);
            this.triggerMethod.apply(this, ['before:destroy'].concat(args));
            this.triggerMethod.apply(this, ['destroy'].concat(args));
    
            this.stopListening();
            this.off();
            this.socket.close();
        }
    });
    
    
    

    /**
     * Dashboard
     */
    
    
    Debugger.Dashboard = function (selector, options) {
        // check if selector is given
        if (!selector) {
            throwError('You must specify a selector to create a Dashboard.');
        }
    
        _.bindAll(this, 'update');
    
        this._devices = {};
        this._programs = {};
    
        // keep track of time domain, this is required when adding dynamically new
        // devices or programs in order to sync their timescale.
        this._domain = [_.now(), 0];
    
        if (_.isFunction(this.initialize)) {
            this.initialize(selector, options);
        }
    };
    
    _.extend(Debugger.Dashboard.prototype, Backbone.Events, {
        initialize: function (selector, options) {
            var self = this;
    
            options || (options = {});
    
            // set default options in case some is omitted
            this.options = _.defaults(options, {
                width: 960,
                widget: {
                    width: 960,
                    height: 50,
                    margin: {
                        top: 10,
                        left: 0,
                        bottom: 10,
                        right: 0
                    },
                    placeholder: {
                        sidebar: {
                            width: 200
                        }
                    }
                },
                ruler: {
                    width: 30
                }
            });
    
            this._init_ui(selector);
            this._init_d3();
        },
    
        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be preferred to global lookups where possible.
        $: function (selector) {
            return this.$el.find(selector);
        },
    
        // import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Debugger.triggerMethod,
    
        /**
         * Connect the dashboard to a `connector`.
         *
         * @param connector Connector to connect this dashboard with.
         * @returns {Debugger.Dashboard}
         */
        connect: function (connector) {
            if (this.connector) {
                // unregister if already registered.
                Debugger.logger.warn("Dashboad connection reinitialized: the dashboad was already connected to a connector.");
                this.connector.off('frame:received', this.update);
            }
    
            // register to *connector* events
            this.connector = connector;
            this.connector.on('frame:received', this.update);
    
            return this;
        },
    
        /**
         * Update dashboard with new data. This is generally called by the connected
         * connector when new data are received.
         *
         * @param data
         */
        update: function (data) {
            if (data instanceof Array) {
                var lastFrame = data.pop();
                _.each(data, function (frame) {
                    this._update_all_with_frame(frame, {render: false});
                }, this);
                this._update_all_with_frame(lastFrame);
                this._notifyWidgetsOfRulerPosition();
            } else {
                this._update_all_with_frame(data);
            }
        },
    
        // Private API
    
        /**
         * Initialize the UI within the container designated by the `selector`.
         *
         * @param selector Selector of the element in which to initialize the UI.
         * @private
         */
        _init_ui: function (selector) {
            var self = this;
    
            // create the ruler
            this._$ruler = $('<div class="rule"><div class="line"></div></div>')
                .css({
                    'width': this.options.ruler.width,
                    'margin-left': this.options.widget.placeholder.sidebar.width
                });
    
            // create the footer
            this._$footer = $('<footer></footer>');
    
            // create the widgets holder
            this._$container = $('<div class="container"></div>');
    
            // setup the dashboard
            this.$el = $(selector).css({
                width: parseInt(this.options.width) + "px"
            }).addClass('dashboard').append(this._$ruler, this._$container, this._$footer);
    
            // make the ruler draggable
            this._$ruler.draggable({
                axis: 'x',
                containment: 'parent',
                drag: function (event, ui) {
                    self._notifyWidgetsOnRulerFocusChanged(ui.position);
                }
            });
        },
    
        /**
         * Initialize D3
         *
         * @private
         */
        _init_d3: function () {
            // define main timescale
            this.timescale = d3.time.scale().range([0, this.options.with]);
    
            // create focusline
            this._focusline = new Debugger.Widgets.Focusline({id: 'default'}, {
                height: 20,
                placeholder: this.options.widget.placeholder
            });
    
            this._attach_widget(this._focusline, this._$footer);
    
            // create timelines
            this._timeline = new Debugger.Widgets.Timeline({
                id: 'timeline',
                name: 'Main',
                orientation: 'bottom'
            }, {
                height: 30,
                placeholder: this.options.widget.placeholder
            });
    
            this._attach_widget(this._timeline, this._$container);
        },
    
        /**
         * Notify widgets of the position of the ruler.
         *
         * @private
         */
        _notifyWidgetsOfRulerPosition: function() {
            this._notifyWidgetsOnRulerFocusChanged(this._$ruler.position());
        },
    
        /**
         * Notify widgets that the ruler is at some `position`.
         *
         * @param position Position of the ruler.
         * @private
         */
        _notifyWidgetsOnRulerFocusChanged: function(position) {
            // offset = parent.offset.left - ruler.width/2
            var offset = this.$el.offset().left - this.options.ruler.width / 2;
            // invoke rulerFocusChanged on all devices & programs
            _.invoke(this._devices, 'rulerFocusChanged', position.left - offset);
            _.invoke(this._programs, 'rulerFocusChanged', position.left - offset);
        },
    
        /**
         * Update all widgets attached to the dashboard according to some `frame` data.
         *
         * @param frame Data frame to update widgets with.
         * @private
         */
        _update_all_with_frame: function (frame, options) {
            // update domain
            this._domain = [Math.min(this._domain[0], frame.timestamp), Math.max(this._domain[1], frame.timestamp)];
    
            // update focusline
            this._focusline.update({
                timestamp: frame.timestamp,
                frame: {
                    value: _.size(frame.devices) + _.size(frame.programs)
                }
            }, this._domain, options);
    
            var updated_device_ids = [];
    
            // update devices listed in frame
            _.forEach(frame.devices, function (update) {
                // create device if it does not exit yet
                if (!this._has_widget('device', update.id)) {
                    this._create_widget('device', update);
                }
    
                // update it
                this._update_one_with_frame('device', update.id, {
                    timestamp: frame.timestamp,
                    frame: update
                }, options);
    
                // mark as updated
                updated_device_ids.push(update.id);
            }, this);
    
            // update all other devices (timestamp only)
            _.forEach(this._devices, function (device, device_id) {
                if (!_.contains(updated_device_ids, device_id)) {
                    this._update_one_with_frame('device', device_id, {timestamp: frame.timestamp}, options);
                }
            }, this);
    
            var updated_program_ids = [];
    
            // update devices listed in frame
            _.forEach(frame.programs, function (update) {
                // create program if it does not exit yet
                if (!this._has_widget('program', update.id)) {
                    this._create_widget('program', update);
                }
    
                // update it
                this._update_one_with_frame('program', update.id, {
                    timestamp: frame.timestamp,
                    frame: update
                }, options);
    
                // mark as updated
                updated_program_ids.push(update.id);
            }, this);
    
            // update all other programs (timestamp only)
            _.forEach(this._programs, function (program, program_id) {
                if (!_.contains(updated_program_ids, program_id)) {
                    this._update_one_with_frame('program', program_id, {timestamp: frame.timestamp}, options);
                }
            }, this);
    
            // update timeline
            this._timeline.update({
                timestamp: frame.timestamp
            }, this._domain, options);
        },
    
        /**
         * Update a `what` widget if id `id` according to some `frame` data.
         *
         * @param what Kind of widget to update (e.g. 'program', 'device')
         * @param id Id of the widget to update
         * @param frame Data frame to update the widget with.
         * @private
         */
        _update_one_with_frame: function (what, id, frame, options) {
            if (this._has_widget(what, id)) {
                var widget = what === 'device' ? this._devices[id] : this._programs[id];
                widget.update(frame, this._domain, options);
            }
        },
    
        /**
         * Check whether a `what` widget with id `id` exists.
         *
         * @param what Kind of widget to check (e.g. 'program', 'device')
         * @param id Id of the widget to check
         * @returns {boolean} true if it exists, false otherwise.
         * @private
         */
        _has_widget: function (what, id) {
            switch (what) {
                case 'device':
                    return _.has(this._devices, id);
                case 'program':
                    return _.has(this._programs, id);
                default:
                    false;
            }
        },
    
        /**
         * Create a new `what` widget with given `attributes`.
         *
         * @param what Kind of widget to check (e.g. 'program', 'device')
         * @param attributes
         * @returns {object} The widget created.
         * @private
         */
        _create_widget: function (what, attributes) {
            var widget = undefined;
    
            switch (what) {
                case 'program':
                    widget = new Debugger.Widgets.Program(
                        {
                            id: attributes.id
                        }, {
                            width: this.options.widget.width,
                            height: this.options.widget.height,
                            margin: this.options.widget.margin,
                            placeholder: this.options.widget.placeholder,
                            ruler: this.options.ruler
                        }
                    );
                    break;
                case 'device':
                    switch (attributes.type) {
                        case 'Temperature':
                            widget = new Debugger.Widgets.Temperature(
                                {
                                    id: attributes.id
                                }, {
                                    width: this.options.widget.width,
                                    height: this.options.widget.height,
                                    margin: this.options.widget.margin,
                                    placeholder: this.options.widget.placeholder,
                                    ruler: this.options.ruler
                                }
                            );
                            break;
                        case 'Switch':
                            widget = new Debugger.Widgets.Switch(
                                {
                                    id: attributes.id
                                }, {
                                    width: this.options.widget.width,
                                    height: this.options.widget.height,
                                    margin: this.options.widget.margin,
                                    placeholder: this.options.widget.placeholder,
                                    ruler: this.options.ruler
                                }
                            );
                            break;
                        case 'Contact':
                            widget = new Debugger.Widgets.Contact(
                                {
                                    id: attributes.id
                                }, {
                                    width: this.options.widget.width,
                                    height: this.options.widget.height,
                                    margin: this.options.widget.margin,
                                    placeholder: this.options.widget.placeholder,
                                    ruler: this.options.ruler
                                }
                            );
                            break;
                        case 'KeyCardSwitch':
                            widget = new Debugger.Widgets.KeycardSwitch(
                                {
                                    id: attributes.id
                                }, {
                                    width: this.options.widget.width,
                                    height: this.options.widget.height,
                                    margin: this.options.widget.margin,
                                    placeholder: this.options.widget.placeholder,
                                    ruler: this.options.ruler
                                }
                            );
                            break;
                        case 'ColorLight':
                            widget = new Debugger.Widgets.ColorLight(
                                {
                                    id: attributes.id
                                }, {
                                    width: this.options.widget.width,
                                    height: this.options.widget.height,
                                    margin: this.options.widget.margin,
                                    placeholder: this.options.widget.placeholder,
                                    ruler: this.options.ruler
                                }
                            );
                            break;
                    }
                    break;
            }
    
            if (widget) {
                // keep track of new created widget
                switch (what) {
                    case 'device':
                        this._devices[attributes.id] = widget;
                        break;
                    case 'program':
                        this._programs[attributes.id] = widget;
                        break;
                }
                // attach it to the DOM
                this._attach_widget(widget);
            } else {
                //throwError('Unable to create device of type #{type}', attributes);
            }
    
            return widget;
        },
    
        /**
         * Attach a widget to a target element within this dashboard.
         * If multiple elements match the target then the widget is append to the first found.
         *
         * @param widget
         * @param target
         * @private
         */
        _attach_widget: function (widget, target) {
            if (this.$(widget.el).length > 0) {
                throwError("Widget #{widget} already attached to dashboard.", { widget: widget});
            }
    
            if (target) {
                this.$(target).first().append(widget.$el);
            } else {
                this._$container.append(widget.$el);
            }
    
            // notify
            this.triggerMethod.apply(widget, ['attached'].concat(this.$el));
        }
    });
    
    var Widgets = Debugger.Widgets = {};
    
    /**
     * Base class for Debugger Widget.
     */
    
    Widgets.Widget = function (attributes, options) {
        var self = this;
    
        this.attributes = _.defaults({}, attributes || {}, _.result(this, 'defaults'));
    
        // check if an *id* and a *kind* is given
        _.forEach(['id', 'kind'], function (key) {
            _.has(self.attributes, key) || throwError('You must specify some *#{key}* to create a Widget.', { key: key});
        });
    
        _.bindAll(this);
    
        this.exprs = {};
        this.buffer = new Debugger.SmartBuffer(this.attributes.buffer);
        this.gid = this.attributes.kind + "-" + sluggify(this.attributes.id);
    
        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
    };
    
    Widgets.Widget.extend = Debugger.extend;
    
    //
    // Widget methods
    //
    
    _.extend(Widgets.Widget.prototype, Backbone.Events, {
        initialize: function (options) {
            var self = this;
    
            options || (options = {});
    
            // set default options in case some is omitted
            this.options = _.defaults(options, {
                width: 960,
                height: 100,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                placeholder: {
                    sidebar: {
                        width: 100
                    }
                },
                ruler: {
                    width: 30
                }
            });
    
            // compute expressions
            this.compute('svg.width', 'this.options.width - this.options.placeholder.sidebar.width - this.options.margin.left - this.options.margin.right');
            this.compute('svg.height', 'this.options.height - this.options.margin.top - this.options.margin.bottom');
    
            // init ui
            this._init_ui();
        },
    
        _init_ui: function () {
            var args = Array.prototype.slice.call(arguments);
    
            // notify that we are going to initialize UI
            this.triggerMethod.apply(this, ['before:init:UI'].concat(args));
    
            // main element
            this.$el = $('<div/>')
                .attr({
                    id: this.gid
                })
                .addClass('element')
                .css({
                    'margin-top': this.options.margin.top,
                    'margin-left': this.options.margin.left,
                    'margin-bottom': this.options.margin.bottom,
                    'margin-right': this.options.margin.right
                })
                .append('<div class="placeholder sidebar"></div>')
                .append('<div class="placeholder d3"></div>')
                .append('<div class="placeholder aside"></div>');
    
            this.el = this.$el[0];
    
            // side bar located at the left of d3 placeholder
            this._$sidebar = this.$('.placeholder.sidebar').css({
                'width': this.options.placeholder.sidebar.width,
                'height': this.computed('svg.height')
            });
            // d3 placeholder (where we draw)
            this._$d3 = this.$('.placeholder.d3').css({
                'width': this.computed('svg.width'),
                'height': this.computed('svg.height')
            }).append(BASE_SVG);
            // placeholder located/floating around the ruler
            this._$aside = this.$('.placeholder.aside').css({
                'height': this.computed('svg.height')
            });
    
            // notify that we are initializing UI
            this.triggerMethod.apply(this, ['init:UI'].concat(args));
        },
    
        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be preferred to global lookups where possible.
        $: function (selector) {
            return this.$el.find(selector);
        },
    
        /**
         * Handler for attached event.
         * @param to
         */
        onAttached: function (to) {
            var args = Array.prototype.slice.call(arguments);
    
            // set ourselves as attached
            this.isAttached = true;
    
            // notify that we are going to initialized d3
            this.triggerMethod.apply(this, ['before:init:d3'].concat(args));
    
            // d3 SVG object
            this.svg = d3.select(this._$d3[0]).select("svg").attr({
                'width': this.computed('svg.width'),
                'height': this.computed('svg.height')
            }).append("g");
    
            // setup d3 functions
            this.dateFn = function (timestamp) {
                return new Date(parseInt(timestamp))
            };
    
            // setup d3 timescale
            this.timescale = d3.time.scale()
                .range([0, this.computed('svg.width')]);
    
            // notify that we are initializing d3
            this.triggerMethod.apply(this, ['init:d3'].concat(args));
        },
    
        /**
         * Return the value of a computed property.
         *
         * @param property
         * @returns {*}
         */
        computed: function (property) {
            return this.exprs[property].value;
        },
    
        /**
         * Compute the value of a `property' given some expression.
         *
         * @warning the value is not automatically recomputed.
         *
         * @param property
         * @param expression
         * @returns {*}
         */
        compute: function (property, expression) {
            this.exprs[property] = {
                expression: expression,
                value: eval(expression)
            };
    
            return this.exprs[property].value;
        },
    
        update: function (data, domain, options) {
            // set default options
            options = _.defaults({}, options, {
                render: true
            });
    
            // build up args for callback
            var args = Array.prototype.slice.call([data, domain, options]);
    
            // trigger onBeforeFrameUpdate
            this.triggerMethod.apply(this, ['before:frame:update'].concat(args));
    
            // collect new data
            if (data && data.bulk) {
                this.buffer.concat(data.bulk)
            } else if (data && data.timestamp) {
                this.buffer.push(data.timestamp, data.frame);
            }
    
            // render only if required
            if (options && options.render) {
                // update d3
                this.timescale.domain(d3.extent(domain, this.dateFn));
    
                // trigger onFrameUpdate
                this.triggerMethod.apply(this, ['frame:update'].concat(args));
            }
        },
    
        rulerFocusChanged: function (position) {
            var timestamp = this.timescale.invert(parseInt(position)).getTime();
            var frame = this.buffer.at(timestamp);
    
            // trigger onBeforeRulerFocusUpdate
            this.triggerMethod.apply(this, ['before:ruler:focus:update', position, timestamp, frame]);
    
            // hide widget if it does not have any state (meaning it disappeared)
            if (missing(frame, 'data.event.state')) {
                this.$el.css('opacity', 0.1);
            } else {
                this.$el.css('opacity', 1);
            }
    
            // trigger onRulerFocusUpdate
            this.triggerMethod.apply(this, ['ruler:focus:update', position, timestamp, frame]);
        },
    
        /**
         * Handler for detached event.
         *
         * @param from
         */
        onDetached: function (from) {
            var args = Array.prototype.slice.call(arguments);
    
            this.triggerMethod.apply(this, ['before:destroy:d3'].concat(args));
    
            this.svg.selectAll('*').remove();
            this.svg.remove();
            this.svg = null;
    
            this.triggerMethod.apply(this, ['destroy:d3'].concat(args));
        },
    
        // import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Debugger.triggerMethod
    });
    
    //
    // Widgets mixins.
    //
    Widgets.Mixins = {
        Chart: {
            initD3Chart: function () {
                this.chart = this.svg.insert('g', '.markers').attr({class: 'area'}).selectAll('rect');
                this.chart_border = this.svg.insert('path', '.markers').attr({class: 'border'});
                this.chart_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'border pending'});
            },
            updateD3Chart: function () {
                var self = this;
    
                // chart
                var chart = this.chart = this.chart.data(
                    this.buffer.select(function (d) {
                        return ensure(d, 'data.event.type', 'update');
                    }),
                    function (d) {
                        return d.timestamp
                    }
                );
    
                chart.enter().append('rect').attr({
                    x: function (d) {
                        return self.timescale(self.dateFn(d.timestamp));
                    },
                    y: function (d) {
                        return self.computed('svg.height') - self.y(self.valueFn(d.data));
                    },
                    width: function (d) {
                        return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                    },
                    height: function (d) {
                        return self.y(self.valueFn(d.data))
                    }
                });
                chart.attr({
                    x: function (d) {
                        return self.timescale(self.dateFn(d.timestamp))
                    },
                    y: function (d) {
                        return self.computed('svg.height') - self.y(self.valueFn(d.data))
                    },
                    width: function (d) {
                        return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                    },
                    height: function (d) {
                        return self.y(self.valueFn(d.data))
                    }
                });
                chart.exit().remove();
    
                // border
                var line = d3.svg.line()
                    .x(function (d) {
                        return self.timescale(self.dateFn(d.timestamp));
                    })
                    .y(function (d) {
                        if (ensure(d, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.y(self.valueFn(d.data));
                        } else {
                            return self.computed('svg.height') + 1;
                        }
                    })
                    .interpolate("step-after");
                this.chart_border.datum(
                    this.buffer.all(),
                    function (d) {
                        return d.timestamp
                    })
                    .attr("d", line);
    
                // extra border
                var last = this.buffer.last();
                this.chart_extra.attr({
                    x1: self.timescale(self.dateFn(last.timestamp)),
                    y1: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.y(self.valueFn(last.data));
                        } else {
                            return self.computed('svg.height') + 1;
                        }
                    },
                    x2: self.timescale(self.dateFn(last.next.timestamp)),
                    y2: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.y(self.valueFn(last.data));
                        } else {
                            return self.computed('svg.height') + 1;
                        }
                    }
                });
            }
        },
        Markers: {
            initD3Markers: function() {
                this.markers = this.svg.append('g').attr({class: 'markers'}).selectAll('.marker');
            },
    
            updateD3Markers: function () {
                var self = this;
    
                //
                // markers
                //
                var markers = this.markers = this.markers.data(
                    this.buffer.reject(function (d) {
                        return _.isEmpty(d.data.decorations);
                    }),
                    function (d) {
                        return d.timestamp
                    }
                );
    
                markers.enter().append("g")
                    .attr({
                        class: "marker"
                    })
                    .append("use")
                    .attr({
                        'xlink:href': function (d) {
                            if (d.data.decorations.length > 1) {
                                return "#magnify"
                            } else {
                                return "#" + d.data.decorations[0].type;
                            }
                        },
                        'class': "decoration",
                        //@todo scale(1.5)
                        'transform': 'scale(1.5) translate(' + (-5 * 1.5) + ',' + (self.computed('svg.height') / 1.5 - (10 * 1.5)) + ')',
                    })
                    .on("click", function (d) {
                        alert(d.data.decorations[0].description);
                    });
                markers.attr({
                    transform: function (d) {
                        return "translate(" + self.timescale(self.dateFn(d.timestamp)) + ", 0)";
                    }
                });
                markers.exit().remove()
            }
        }
    };
    
    //
    // Specific widgets
    //
    
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
    
            this.chart = this.svg.selectAll('rect');
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
                },
                'fill': 'blue'
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
    /**
     * Base class for Device widget.
     */
    
    Widgets.Device = Widgets.Widget.extend({
    
        onInitUI: function () {
            this._$name = $('<div/>').addClass('title').css({
                'line-height': this.computed('svg.height') + 'px'
            });
            this._$picto = $('<div/>').addClass('picto').css({
                'height': this.computed('svg.height'),
                'line-height': this.computed('svg.height') + 'px',
                'background-size': this.computed('svg.height') + 'px ' + this.computed('svg.height') + 'px',
                'width': this.computed('svg.height')
            });
            this._$sidebar.append(this._$name, this._$picto);
        },
    
        onInitD3: function () {
            // status is used to display connection/disconnection status
            this.status = this.svg.append('g').attr({class: 'status'}).selectAll('line');
    
            // markers is used to display decoration markers
            this.initD3Markers();
        },
    
        onFrameUpdate: function () {
            var self = this;
    
            //
            // status
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
                y1: this.computed('svg.height') - 1,
                x2: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp));
                },
                y2: this.computed('svg.height') - 1,
                stroke: function (d) {
                    if (d.data.event.type === 'update' && d.data.event.state.status === 'problem') {
                        return 'orange';
                    } else if (d.data.event.type == 'connection') {
                        return 'green';
                    } else if (d.data.event.type == 'disconnection') {
                        return 'red';
                    }
                },
                'stroke-width': 2,
                'stroke-linecap': 'round',
                'stroke-dasharray': "1, 5"
            });
            status.attr({
                x1: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                },
                x2: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp))
                }
            });
            status.exit().remove();
    
            // Markers
            this.updateD3Markers();
        },
    
        onRulerFocusUpdate: function (position, timestamp, frame) {
            // update `aside` position
            if (position < this.computed('svg.width') / 2) {
                this._$aside.css({
                    'left': position + this.options.placeholder.sidebar.width + this.options.ruler.width / 2,
                    'right': 'auto'
                });
            } else {
                this._$aside.css({
                    'left': 'auto',
                    'right': this.computed('svg.width') + this.options.ruler.width / 2 - position
                });
            }
    
            if (frame && frame.data) {
                this._$name.text(frame.data.name);
            }
        }
    });
    
    _.extend(Widgets.Device.prototype, Widgets.Mixins.Markers);
    
    // Specific devices
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
                .range([1, this.computed('svg.height')-1]);
    
            this.initD3Chart();
        },
    
        onFrameUpdate: function () {
            Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);
    
            var self = this;
    
            // update domain
            this.y.domain(d3.extent(
                self.buffer.select(function (d) {
                    return ensure(d.data, 'event') && d.data.event.type == 'update'}
                ), self.valueFn)
            );
    
            this.updateD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, frame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (frame && frame.data) {
                if (frame.data.event.type == 'update' && frame.data.event.state.status == 2) {
                    this._$picto.attr({class: 'picto'}).text(this.valueFn(frame.data)+'°');
                } else {
                    // fallback
                    this._$picto.attr({class: 'picto picto-temperature_type'}).text('');
                }
            } else {
                this._$aside.text('');
            }
        }
    });
    
    _.extend(Widgets.Temperature.prototype, Widgets.Mixins.Chart);
    /**
     * Switch widget.
     */
    
    Widgets.Switch = Widgets.Device.extend({
    
        defaults: {
            kind: 'switch',
            buffer: {
                pairing: true
            }
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.quantize()
                .range([0, this.computed('svg.height')])
                .domain([false, true]);
    
            this.spikes = this.svg.append('g').attr({class: 'spikes'}).selectAll('line');
            this.border = this.svg.insert('path', '.markers').attr({class: 'border'});
            this.border_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'border pending'});
        },
    
        onFrameUpdate: function () {
            Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);
    
            var self = this;
    
            //
            // spikes
            //
            var spikes = this.spikes = this.spikes.data(
                this.buffer.select(function (d) {
                    return ensure(d, 'data.event.type', 'update');
                }),
                function (d) {
                    return d.timestamp
                }
            );
    
            spikes.enter().append('line').attr({
                x1: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                },
                y1: self.y(false),
                x2: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                },
                y2: self.y(true)
            });
            spikes.attr({
                x1: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                },
                x2: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                }
            });
            spikes.exit().remove();
    
            //
            // borders
            //
            var last = this.buffer.last();
            var line = d3.svg.line()
                .x(function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                })
                .y(function (d) {
                    if (ensure(d, 'data.event.type', 'update')) {
                        return self.computed('svg.height');
                    } else {
                        return self.computed('svg.height') + 1;
                    }
                })
                .interpolate("step-after");
            this.border.datum(this.buffer.all(),
                function (d) {
                    return d.timestamp
                })
                .attr('d', line);
            this.border_extra.attr({
                x1: self.timescale(self.dateFn(last.timestamp)),
                y1: function() {
                    if (ensure(last, 'data.event.type', 'update')) {
                        return self.computed('svg.height');
                    } else {
                        return self.computed('svg.height') + 1;
                    }
                },
                x2: self.timescale(self.dateFn(last.next.timestamp)),
                y2: function() {
                    if (ensure(last, 'data.event.type', 'update')) {
                        return self.computed('svg.height');
                    } else {
                        return self.computed('svg.height') + 1;
                    }
                }
            });
        },
    
        onRulerFocusUpdate: function (position, timestamp, frame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            var delta = 5;
    
            if (frame && frame.data) {
                var range = [this.timescale.invert(parseInt(position-delta)).getTime(), this.timescale.invert(parseInt(position+delta)).getTime()];
                if (range[0] < frame.timestamp && frame.timestamp < range[1] && ensure(frame, 'data.event.type', 'update') && frame.data.event.picto) {
                    this._$picto.attr({class: 'picto picto-'+frame.data.event.picto});
                } else {
                    // fallback
                    this._$picto.attr({class: 'picto picto-switch_type'}).text('');
                }
            } else {
                this._$aside.text('');
            }
        }
    });
    /**
     * Contact widget.
     */
    
    Widgets.Contact = Widgets.Device.extend({
    
        defaults: {
            kind: 'contact',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onBeforeInitD3: function () {
            if (_.isFunction(Widgets.Device.prototype.onBeforeInitD3)) {
                Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
            }
    
            // setup d3 functions
            this.valueFn = function (d) {
                try {
                    if (d.timestamp) {
                        return d.data.event.state.value;
                    } else {
                        return d.event.state.value;
                    }
                } catch (e) {
                    return 'false';
                }
            };
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.ordinal()
                .range([0, this.computed('svg.height')-1])
                .domain(['false', 'true']);
    
            this.initD3Chart();
        },
    
        onFrameUpdate: function () {
            Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);
    
            this.updateD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, frame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (frame && frame.data && frame.data.event.type == 'update') {
                this._$picto.attr({class: 'picto picto-'+frame.data.event.picto});
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-contact_type'}).text('');
            }
        }
    });
    
    _.extend(Widgets.Contact.prototype, Widgets.Mixins.Chart);
    /**
     * Contact widget.
     */
    
    Widgets.KeycardSwitch = Widgets.Device.extend({
    
        defaults: {
            kind: 'keycardswitch',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onBeforeInitD3: function () {
            if (_.isFunction(Widgets.Device.prototype.onBeforeInitD3)) {
                Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
            }
    
            // setup d3 functions
            this.valueFn = function (d) {
                try {
                    if (d.timestamp) {
                        return d.data.event.state.state;
                    } else {
                        return d.event.state.state;
                    }
                } catch (e) {
                    return 'false';
                }
            };
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.ordinal()
                .range([0, this.computed('svg.height')-1])
                .domain(['false', 'true']);
    
            this.initD3Chart();
        },
    
        onFrameUpdate: function () {
            Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);
    
            this.updateD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, frame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (frame && frame.data && frame.data.event.type == 'update' && frame.data.event.state.status == 2) {
                this._$picto.attr({class: 'picto picto-'+frame.data.event.picto});
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-keycardswitch_type'}).text('');
            }
        }
    });
    
    _.extend(Widgets.KeycardSwitch.prototype, Widgets.Mixins.Chart);
    /**
     * Contact widget.
     */
    
    Widgets.ColorLight = Widgets.Device.extend({
    
        defaults: {
            kind: 'colorlight',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onBeforeInitD3: function () {
            if (_.isFunction(Widgets.Device.prototype.onBeforeInitD3)) {
                Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
            }
    
            // setup d3 functions
            this.valueFn = function (d) {
                try {
                    if (d.timestamp) {
                        return d.data.event.state.state;
                    } else {
                        return d.event.state.state;
                    }
                } catch (e) {
                    return 'false';
                }
            };
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.ordinal()
                .range([0, this.computed('svg.height') - 1])
                .domain(['false', 'true']);
    
            this.initD3Chart();
        },
    
        onFrameUpdate: function () {
            Widgets.Device.prototype.onFrameUpdate.apply(this, arguments);
    
            var self = this;
    
            this.updateD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, frame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (frame && frame.data && frame.data.event.type == 'update' && frame.data.event.state.status == 2) {
                this._$picto.attr({class: 'picto picto-' + frame.data.event.picto});
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-colorlight_type'}).text('');
            }
        }
    });
    
    _.extend(Widgets.ColorLight.prototype, Widgets.Mixins.Chart);
    
    /**
     * Base class for Program widget.
     */
    
    Widgets.Program = Widgets.Widget.extend({
    
        defaults: {
            kind: 'program',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onInitUI: function () {
            this._$name = $('<div/>').addClass('title').css({
                'line-height': this.computed('svg.height') + 'px'
            });
            this._$sidebar.append(this._$name);
        },
    
        onInitD3: function () {
            // state is used to display the program's state
            this.state = this.svg.append('g').attr({class: 'state'}).selectAll('rect');
    
            // markers is used to display decoration markers
            this.initD3Markers();
        },
    
        onFrameUpdate: function () {
            var self = this;
    
            //
            // state
            //
            var state = this.state = this.state.data(
                this.buffer.select(function (d) {
                    return ensure(d, 'data.event');
                }),
                function (d) {
                    return d.timestamp
                }
            );
    
            state.enter().append('rect').attr({
                x: function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                },
                y: function (d) {
                    return 0.25*self.computed('svg.height');
                },
                width: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                },
                height: function (d) {
                    return 0.5*self.computed('svg.height');
                },
                fill: function (d) {
                    if (d.data.event.state.name === 'disabled') {
                        return 'orange';
                    } else if (d.data.event.state.name == 'enabled') {
                        return 'yellow';
                    } else if (d.data.event.state.name == 'invalid') {
                        return 'grey';
                    }
                }
            });
            state.attr({
                x: function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                },
                y: function (d) {
                    return 0.25*self.computed('svg.height');
                },
                width: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp)) - self.timescale(self.dateFn(d.timestamp))
                },
                height: function (d) {
                    return 0.5*self.computed('svg.height');
                },
                fill: function (d) {
                    if (d.data.event.state.name === 'disabled') {
                        return 'orange';
                    } else if (d.data.event.state.name == 'enabled') {
                        return 'yellow';
                    } else if (d.data.event.state.name == 'invalid') {
                        return 'grey';
                    }
                },
                rx: 5,
                ry: 5
            });
            state.exit().remove();
    
            //
            // markers
            //
            this.updateD3Markers();
        },
    
        onRulerFocusUpdate: function (position, timestamp, frame) {
            // update `aside` position
            if (position < this.computed('svg.width') / 2) {
                this._$aside.css({
                    'left': position + this.options.placeholder.sidebar.width + this.options.ruler.width / 2,
                    'right': 'auto'
                });
            } else {
                this._$aside.css({
                    'left': 'auto',
                    'right': this.computed('svg.width') + this.options.ruler.width / 2 - position
                });
            }
    
            if (frame && frame.data) {
                this._$name.text(frame.data.name);
            }
        }
    });
    
    _.extend(Widgets.Program.prototype, Widgets.Mixins.Markers);
    

    return Debugger;
}));