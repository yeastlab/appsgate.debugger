//     AppsGate.Debugger v0.0.1

//
//     Copyright (c)2014 Rémi Barraquand.
//     Distributed under ISC license

(function (root, factory) {
    // Setup AppsGate.Debugger appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'jquery', 'underscore', 'd3', 'exports'], function(Backbone, $, _, d3, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global AppsGateDebugger.
            return (root.AppsGateDebugger = factory(root, exports, Backbone, $, _, d3));
        });
    } else {
        // Else, as a browser global.
        root.AppsGateDebugger = factory(root, {}, root.Backbone, root.$, root._, root.d3);
    }
}(this, function(root, Debugger, Backbone, $, _, d3) {
    'use strict';

    // Initial Setup
    // -------------

    // Save the previous value of the AppsGateDebugger variable, so that it can be restored later on, if noConflict is used.
    var previousDebugger = root.AppsGateDebugger;

    // Current version of the library. Keep in sync with package.json.
    Debugger.VERSION = '0.0.1';

    // Runs AppsGate.Debugger.js in noConflict mode, returning the AppsGateDebugger variable to its previous owner.
    // Returns a reference to this AppsGateDebugger object.
    Debugger.noConflict = function() {
        root.AppsGateDebugger = previousDebugger;
        return this;
    };

    // Borrow Backbone.extend function.
    Debugger.extend = Backbone.Model.extend;

    // Inline include of SVG file for faster loading.
    var BASE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><defs><g id="colorlight_state_off"><g transform="matrix(.18519 0 0 .18519-12.778-148.7)"><path fill="#f9f9f9" d="m122 847c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34"/><path d="m122 847c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/></g><path opacity=".62" fill="#fff" d="m5.88 6.185l.018-.796c.127-.099.243-.219.338-.36.47-.7.291-1.644-.399-2.107-.69-.463-1.631-.27-2.101.431-.47.7-.292 1.644.399 2.106.005.003.011.006.015.009l-.015.703 1.745.014"/><path fill="#605f5f" d="m99.52 841.39l-7.371.059c-.416.003-.621-.284-.625-.616-.002-.331.199-.621.615-.624l7.371-.059c.418-.003.621.285.625.616.002.331-.197.622-.615.624m-3.719-22.08c4.9-.038 8.889 3.89 8.928 8.772.02 2.494-1.01 4.769-2.666 6.389-.518.634-.82 1.44-.902 3.714-.021.548-.422.803-.848.787s-.807-.3-.787-.848c.09-2.408.441-3.695 1.342-4.768 1.365-1.322 2.242-3.213 2.225-5.262-.029-3.98-3.281-7.182-7.281-7.15-3.98.031-7.18 3.283-7.15 7.264.018 2.047.922 3.924 2.307 5.225.918 1.059 1.291 2.34 1.416 4.747.029.547-.348.837-.773.858-.424.023-.83-.227-.857-.772-.119-2.272-.434-3.073-.961-3.699-1.684-1.595-2.746-3.853-2.766-6.347-.04-4.882 3.89-8.871 8.773-8.91m3.734 24.12l-7.371.058c-.416.003-.621-.283-.625-.615-.002-.331.199-.622.615-.625l7.371-.057c.418-.004.621.282.625.614.002.332-.197.623-.615.625m-.781 2.045l-5.777.046c-.418.003-.621-.284-.625-.615-.002-.332.197-.622.615-.626l5.779-.044c.416-.003.621.283.623.614.004.333-.197.623-.615.625m-.877.843c-.305.67-1.088 1.149-2.01 1.156-.922.008-1.713-.46-2.027-1.125l4.03-.031" transform="matrix(.18519 0 0 .18519-12.778-148.7)"/><path stroke-width=".37" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m1.111 1.481h1.296"/></g><g id="colorlight_state_on"><g transform="matrix(.18519 0 0 .18519-24.26-148.7)"><path d="m184 847c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path fill="#605f5f" d="m161.76 841.62l-7.371.059c-.416.003-.621-.284-.625-.616-.002-.331.199-.621.615-.624l7.371-.059c.418-.003.621.285.625.616.002.331-.197.622-.615.624m-3.719-22.08c4.9-.038 8.889 3.89 8.928 8.772.02 2.494-1.01 4.769-2.666 6.389-.518.634-.82 1.44-.902 3.714-.021.548-.422.803-.848.787s-.807-.3-.787-.848c.09-2.408.441-3.695 1.342-4.768 1.365-1.322 2.242-3.213 2.225-5.262-.029-3.98-3.281-7.182-7.281-7.15-3.98.031-7.18 3.283-7.15 7.264.018 2.047.922 3.924 2.307 5.225.918 1.059 1.291 2.34 1.416 4.747.029.547-.348.837-.773.858-.424.023-.83-.227-.857-.772-.119-2.272-.434-3.073-.961-3.699-1.684-1.595-2.746-3.853-2.766-6.347-.039-4.883 3.89-8.871 8.773-8.91m3.734 24.11l-7.371.058c-.416.003-.621-.283-.625-.615-.002-.331.199-.622.615-.625l7.371-.057c.418-.004.621.282.625.614.003.332-.197.623-.615.625m-.781 2.045l-5.777.046c-.418.003-.621-.284-.625-.615-.002-.332.197-.622.615-.626l5.779-.044c.416-.003.621.283.623.614.004.333-.197.623-.615.625m-.877.844c-.305.67-1.088 1.149-2.01 1.156-.922.008-1.713-.46-2.027-1.125l4.03-.031"/><circle cy="815.73" cx="142.73" r="6.397" fill="#f8c500"/></g></g><g id="colorlight_type"><path opacity=".62" fill="#fff" d="m5.88 6.185l.018-.796c.127-.099.243-.219.338-.36.47-.7.291-1.644-.399-2.107-.69-.463-1.631-.27-2.101.431-.47.7-.292 1.644.399 2.106.005.003.011.006.015.009l-.015.703 1.745.014"/><path fill="#605f5f" d="m99.52 841.39l-7.371.059c-.416.003-.621-.284-.625-.616-.002-.331.199-.621.615-.624l7.371-.059c.418-.003.621.285.625.616.002.331-.197.622-.615.624m-3.719-22.08c4.9-.038 8.889 3.89 8.928 8.772.02 2.494-1.01 4.769-2.666 6.389-.518.634-.82 1.44-.902 3.714-.021.548-.422.803-.848.787s-.807-.3-.787-.848c.09-2.408.441-3.695 1.342-4.768 1.365-1.322 2.242-3.213 2.225-5.262-.029-3.98-3.281-7.182-7.281-7.15-3.98.031-7.18 3.283-7.15 7.264.018 2.047.922 3.924 2.307 5.225.918 1.059 1.291 2.34 1.416 4.747.029.547-.348.837-.773.858-.424.023-.83-.227-.857-.772-.119-2.272-.434-3.073-.961-3.699-1.684-1.595-2.746-3.853-2.766-6.347-.04-4.882 3.89-8.871 8.773-8.91m3.734 24.12l-7.371.058c-.416.003-.621-.283-.625-.615-.002-.331.199-.622.615-.625l7.371-.057c.418-.004.621.282.625.614.002.332-.197.623-.615.625m-.781 2.045l-5.777.046c-.418.003-.621-.284-.625-.615-.002-.332.197-.622.615-.626l5.779-.044c.416-.003.621.283.623.614.004.333-.197.623-.615.625m-.877.843c-.305.67-1.088 1.149-2.01 1.156-.922.008-1.713-.46-2.027-1.125l4.03-.031" transform="matrix(.18519 0 0 .18519-12.778-148.7)"/></g><g id="connection"><g transform="matrix(.15994 0 0 .15994 1.197-108.4)" fill="#9acf00"><path d="m27.57 704.8c.49-.699.329-1.663-.367-2.153l-.23-.161c-.691-.491-1.658-.321-2.148.38l-24.54 34.821c-.492.7-.33 1.665.367 2.154l.228.162c.695.489 1.658.318 2.151-.383l24.539-34.82"/><path d="m27.598 692.96l7.665-10.878c.976-1.387.972-3.085-.026-3.786l-.336-.224c-.986-.708-2.593-.146-3.57 1.244l-7.496 10.639"/><path d="m39.17 700.79l7.664-10.876c.975-1.388.972-3.086-.026-3.788l-.334-.224c-.987-.706-2.594-.144-3.57 1.247l-7.496 10.637"/><path d="m39.27 694.64l-9.262-6.166"/><path d="m25.379 685.39l-3.872-2.578-7.877 11.836c-3 4.516-1.905 10.713 2.289 14.988l-1.329 3.892 7.235 4.814 3.314-2.613c5.521 2.122 11.563.726 14.541-3.745l7.878-11.835-3.655-2.431"/></g></g><g id="contact_state_off"><g transform="matrix(.16949 0 0 .16949-63.898-41.36)"><path d="m435 293c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39" fill="#f9f9f9"/><path d="m435 293c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m429 286.16c0 1.56-1.275 2.835-2.835 2.835h-37.33c-1.56 0-2.835-1.275-2.835-2.835v-5.33c0-1.56 1.275-2.835 2.835-2.835h37.33c1.56 0 2.835 1.275 2.835 2.835v5.33" fill="#a0a0a0"/></g><path transform="matrix(.94274.33352-.33352.94274 0 0)" fill="#a0a0a0" d="m5.238.645h2.203v.508h-2.203z"/></g><g id="contact_state_on"><g transform="matrix(.16949 0 0 .16949-10.508-40.847)"><path fill="#f9f9f9" d="m120 290c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39"/><path d="m120 290c0 4.971-4.03 9-9 9h-39c-4.971 0-9-4.03-9-9v-39c0-4.971 4.03-9 9-9h39c4.971 0 9 4.03 9 9v39z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path fill="#a0a0a0" d="m114 281.16c0 1.56-1.275 2.835-2.835 2.835h-37.32c-1.56 0-2.835-1.28-2.835-2.84v-5.33c0-1.55 1.275-2.83 2.835-2.83h37.33c1.56 0 2.835 1.275 2.835 2.835v5.33z"/></g><path fill="#a0a0a0" d="m3.898 4.746h2.203v.508h-2.203z"/></g><g id="contact_type"><g fill="#a0a0a0"><path d="m114 281.16c0 1.56-1.275 2.835-2.835 2.835h-37.33c-1.56 0-2.835-1.28-2.835-2.84v-5.33c0-1.55 1.275-2.83 2.835-2.83h37.33c1.56 0 2.835 1.275 2.835 2.835v5.33" transform="matrix(.16949 0 0 .16949-10.508-40.847)"/><path d="m3.898 4.746h2.203v.508h-2.203z"/></g></g><g id="disconnection"><g transform="matrix(.15994 0 0 .15994 1.197 0)" fill="#ce4242"><path d="m27.57 27.04c.491-.699.329-1.663-.367-2.153l-.23-.161c-.691-.491-1.658-.321-2.148.38l-24.541 34.822c-.492.7-.33 1.665.367 2.154l.228.162c.695.489 1.658.318 2.151-.383l24.54-34.821" stroke-width=".6"/><path d="m27.598 15.194l7.665-10.878c.975-1.387.971-3.085-.027-3.786l-.336-.224c-.986-.708-2.593-.146-3.57 1.244l-7.497 10.639"/><path d="m39.17 23.03l7.664-10.876c.975-1.388.971-3.086-.026-3.788l-.334-.224c-.988-.706-2.594-.144-3.571 1.246l-7.496 10.637"/><path d="m39.27 16.879l-9.262-6.166"/><path d="m25.378 7.633l-3.872-2.578-7.876 11.836c-3.01 4.516-1.905 10.713 2.289 14.988l-1.329 3.892 7.235 4.814 3.314-2.613c5.521 2.122 11.564.726 14.541-3.745l7.878-11.835-3.655-2.431"/></g></g><g id="keycardswitch_state_in"><g transform="matrix(.17857 0 0 .17857-40-57.679)"><path fill="#f9f9f9" d="m279 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36"/><path d="m279 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/></g><g transform="matrix(.17857 0 0 .17857-40-57.679)"><path opacity=".31" fill="#bf9100" d="m260.42 350h-17.42v-7.13z"/><path stroke-width="2" stroke="#f9f9f9" stroke-miterlimit="10" fill="none" d="m252 353v14"/><path fill="#f9f9f9" d="m255 366.36l-3 3.39-3-3.39v-2.88l3 3.39 3-3.39z"/></g><path fill="#333" d="m2.679 3.929h4.464v5h-4.464z"/><path transform="matrix(.17857 0 0 .17857-40-57.679)" stroke="#cecece" stroke-miterlimit="10" fill="none" d="m240.38 346.17l1.95 3.33h19.67l1.27-3.36"/><path fill="#f8c500" d="m3.393 3.571h3.214v1.25h-3.214z"/></g><g id="keycardswitch_state_out"><g transform="matrix(.17857 0 0 .17857-11.607-57.679)"><path fill="#f9f9f9" d="m120 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36"/><path d="m120 369c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/></g><path fill="#333" d="m2.857 3.929h4.286v5h-4.286z"/><path transform="matrix(.17857 0 0 .17857-11.607-57.679)" stroke="#cecece" stroke-miterlimit="10" fill="none" d="m81.43 346.14l1.95 3.36h19.72l1.27-3.38"/><path fill="#f8c500" d="m3.571.893h2.857v3.75h-2.857z"/><path opacity=".31" transform="matrix(.17857 0 0 .17857-11.607-57.679)" fill="#bf9100" d="M85 328.22 101.51 349 85 349z"/></g><g id="keycardswitch_type"><g fill="#666"><path d="m2.857 3.929h4.286v5h-4.286z"/><path transform="matrix(.17857 0 0 .17857-11.607-57.679)" stroke="#cecece" stroke-miterlimit="10" d="m81.43 346.14l1.95 3.36h19.72l1.27-3.38"/></g><path fill="#999" d="m3.571.893h2.857v3.75h-2.857z"/><path opacity=".31" transform="matrix(.17857 0 0 .17857-11.607-57.679)" fill="#666" d="M85 328.22 101.51 349 85 349z"/></g><g id="magnify"><g transform="matrix(.06305 0 0 .06335 0-.157)"><path d="m67.37 66.43c-3.964 3.973-3.972 10.405 0 14.369l73.899 73.903c3.971 3.964 10.401 3.964 14.373 0 3.963-3.972 3.963-10.412 0-14.376l-73.903-73.889c-1.981-1.984-4.58-2.976-7.18-2.976-2.6 0-5.201.992-7.188 2.976z"/><path d="m5.804 55.611c0 27.609 22.377 49.992 49.981 49.992 27.597 0 49.98-22.383 49.98-49.992 0-27.595-22.377-49.969-49.975-49.969-27.604 0-49.981 22.374-49.981 49.972z" fill="#0ff"/><path d="m55.891 16.495c9.06 0 17.537 1.599 24.78 4.372-6.461-5.217-15.177-8.424-24.78-8.424-9.603 0-18.321 3.207-24.781 8.424 7.243-2.773 15.717-4.372 24.781-4.372" fill="#fff"/><path d="m76.75 51.43v7.932h-16.468v16.771h-8.64v-16.771h-16.468v-7.932h16.468v-16.869h8.64v16.869h16.468" fill="#1a1a1a"/><g fill="#666"><path d="m86.16 99.58l14.09 14.1 14.37-14.369-14.1-14.09-14.364 14.368"/><path d="m0 55.829c0 30.93 25.07 56.01 56 56.01 30.924 0 55.998-25.08 55.998-56.01 0-30.92-25.07-55.997-55.998-55.997-30.93-.005-56 25.07-56 55.992z"/></g></g></g><g id="program"><g transform="matrix(.10837 0 0 .1001-.418.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g></g><g id="programe"><g transform="matrix(.10837 0 0 .1001-.418.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g></g><g id="read"><g transform="matrix(.10837 0 0 .1001.442.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g><path d="m4.605 7.172v-.697h-2.271-2.271v-1.17-1.17h2.271 2.271l.004-.695.004-.695 1.549 1.279c1.197.989 1.34 1.151 1.528 1.306-.024.032-3.061 2.539-3.076 2.539-.005 0-.01-.314-.01-.697z" stroke="#0000bf" stroke-width=".045" fill="#3a88ff"/></g><g id="smartplug_off"><g transform="matrix(.18519 0 0 .18519-52.963-162.96)"><path d="m339 924c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34" fill="#f9f9f9"/><g stroke-miterlimit="10"><path d="m339 924c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34z" stroke="#f8c500" stroke-width="2" fill="none"/><circle stroke-width=".5" cx="316.83" cy="909.15" stroke="#545454" r="10.38" fill="#fff"/></g></g><g fill="#605f5f" transform="matrix(.18519 0 0 .18519-52.963-162.96)"><circle cx="322.96" cy="910.08" r="1.393"/><circle cx="310.63" cy="910.08" r="1.392"/></g><path d="m6.01 4.384c0 .172-.139.31-.31.31-.171 0-.31-.139-.31-.31 0-.171.139-.31.31-.31.171 0 .31.139.31.31" fill="#999"/><path stroke-width=".37" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m2.037 2.778h1.296"/></g><g id="smartplug_on"><g transform="matrix(.18519 0 0 .18519-79.07-163.15)"><path d="m480 925c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34" fill="#f9f9f9"/><g stroke-miterlimit="10"><path d="m480 925c0 4.971-4.03 9-9 9h-34c-4.971 0-9-4.03-9-9v-34c0-4.971 4.03-9 9-9h34c4.971 0 9 4.03 9 9v34z" stroke="#f8c500" stroke-width="2" fill="none"/><circle stroke-width=".5" cx="453.83" cy="906.15" stroke="#545454" r="10.38" fill="#fff"/></g></g><g transform="matrix(.18519 0 0 .18519-79.07-163.15)"><g fill="#605f5f"><circle cx="459.96" cy="907.08" r="1.393"/><circle cx="447.63" cy="907.08" r="1.392"/></g><circle cx="437.73" cy="891.73" stroke-miterlimit="10" r="6.397" fill="#f8c500"/></g><path d="m5.266 3.643c0 .172-.139.31-.31.31-.171 0-.31-.139-.31-.31 0-.171.139-.31.31-.31.171 0 .31.139.31.31" fill="#999"/></g><g id="smartplug_type"><circle stroke-width=".5" cx="453.83" cy="906.15" transform="matrix(.18519 0 0 .18519-79.07-163.15)" stroke="#545454" stroke-miterlimit="10" r="10.38" fill="#fff"/><path d="m5.266 3.643c0 .172-.139.31-.31.31-.171 0-.31-.139-.31-.31 0-.171.139-.31.31-.31.171 0 .31.139.31.31" fill="#999"/><g fill="#605f5f" transform="matrix(.18519 0 0 .18519-79.07-163.15)"><circle cx="459.96" cy="907.08" r="1.393"/><circle cx="447.63" cy="907.08" r="1.392"/></g></g><g id="switch_state_1"><g transform="matrix(.17857 0 0 .17857-63.75-86.79)"><path d="m412 532c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m412 532c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m401 532c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-27c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v27" fill="#a0a0a0"/></g><g opacity=".09"><path d="m401 532c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-21c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v21" fill="#fff" transform="matrix(.17857 0 0 .17857-63.75-86.79)"/></g><g fill="#f9f9f9"><path d="m3.036 3.393h2.143v4.821h-2.143z"/><path d="m5.179 3.393h1.786v4.821h-1.786z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-63.75-86.79)"><path d="m382.69 497.91c1.525-1.525 3.999-1.524 5.524.001"/><path d="m383.94 499.45c.814-.813 2.132-.812 2.945.001"/><path d="m380.94 495.95c2.336-2.336 6.182-2.276 8.59.133"/></g><path fill="#fff" d="m3.036 3.393h1.964v4.821h-1.964z"/><path fill="#1e1e1e" d="m5 3.393h1.964v4.821h-1.964z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m5.089 3.393v4.821"/><path fill="#f8c500" d="m3.214 3.571h1.607v1.786h-1.607z"/></g><g id="switch_state_3"><g transform="matrix(.17857 0 0 .17857-89.29-87.32)"><path d="m555 535c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m555 535c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m543 534c0 1.104-.896 2-2 2h-27c-1.104 0-2-.896-2-2v-25c0-1.104.896-2 2-2h27c1.104 0 2 .896 2 2v25" fill="#a0a0a0"/></g><g opacity=".09"><path d="m543 534c0 1.104-.896 2-2 2h-27c-1.104 0-2-.896-2-2v-19c0-1.104.896-2 2-2h27c1.104 0 2 .896 2 2v19" fill="#fff" transform="matrix(.17857 0 0 .17857-89.29-87.32)"/></g><g fill="#f9f9f9"><path d="m2.857 3.75h2.143v4.286h-2.143z"/><path d="m5 3.75h1.964v4.286h-1.964z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-89.29-87.32)"><path d="m524.6 501.88c1.462-1.463 3.833-1.462 5.294.001"/><path d="m525.79 503.36c.779-.779 2.042-.778 2.821.001"/><path d="m522.92 500.01c2.238-2.239 5.923-2.182 8.231.126"/></g><path fill="#fff" d="m2.857 3.75h1.964v4.286h-1.964z"/><path fill="#1e1e1e" d="m4.821 3.75h2.143v4.286h-2.143z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m4.911 3.75v4.286"/><path fill="#f8c500" d="m3.036 6.071h1.607v1.786h-1.607z"/></g><g id="switch_state_5"><g transform="matrix(.17857 0 0 .17857-36.964-86.25)"><path d="m262 529c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m262 529c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m251 528c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-26c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v26" fill="#a0a0a0"/></g><g opacity=".09"><path d="m251 528c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-20c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v20" fill="#fff" transform="matrix(.17857 0 0 .17857-36.964-86.25)"/></g><g fill="#f9f9f9"><path d="m3.036 3.393h1.964v4.464h-1.964z"/><path d="m5 3.393h1.964v4.464h-1.964z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-36.964-86.25)"><path d="m232.65 495.86c1.507-1.507 3.951-1.506 5.457.001"/><path d="m233.88 497.39c.804-.804 2.105-.803 2.909.001"/><path d="m230.92 493.93c2.308-2.307 6.106-2.248 8.485.131"/></g><path fill="#fff" d="m3.036 3.393h1.964v4.464h-1.964z"/><path fill="#1e1e1e" d="m5 3.393h1.964v4.464h-1.964z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m5.089 3.393v4.464"/><path fill="#f8c500" d="m5.357 3.571h1.429v1.964h-1.429z"/></g><g id="switch_state_7"><g transform="matrix(.17857 0 0 .17857-65.36-101.43)"><path d="m421 614c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36" fill="#f9f9f9"/><path d="m421 614c0 4.971-4.03 9-9 9h-36c-4.971 0-9-4.03-9-9v-36c0-4.971 4.03-9 9-9h36c4.971 0 9 4.03 9 9v36z" stroke="#f8c500" stroke-miterlimit="10" stroke-width="2" fill="none"/><path d="m409 611c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-26c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v26" fill="#a0a0a0"/></g><g opacity=".09"><path d="m409 611c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-20c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v20" fill="#fff" transform="matrix(.17857 0 0 .17857-65.36-101.43)"/></g><g fill="#f9f9f9"><path d="m2.857 3.036h2.143v4.643h-2.143z"/><path d="m5 3.036h1.964v4.643h-1.964z"/></g><g stroke="#919191" fill="none" stroke-miterlimit="10" transform="matrix(.17857 0 0 .17857-65.36-101.43)"><path d="m390.3 577.68c1.801-1.8 4.721-1.799 6.521.001"/><path d="m391.77 579.51c.96-.96 2.515-.96 3.476.001"/><path d="m388.23 575.37c2.756-2.757 7.296-2.687 10.139.156"/></g><path fill="#fff" d="m2.857 3.036h1.964v4.643h-1.964z"/><path fill="#1e1e1e" d="m4.821 3.036h2.143v4.643h-2.143z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m4.911 3.036v4.643"/><path fill="#f8c500" d="m5.179 5.357h1.429v2.143h-1.429z"/></g><g id="switch_type"><path d="m106 524c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-26c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v26" fill="#a0a0a0" transform="matrix(.17857 0 0 .17857-11.07-86.25)"/><path fill="#fff" d="m3.036 2.857h1.964v4.464h-1.964z"/><path fill="#1e1e1e" d="m5 2.857h1.964v4.464h-1.964z"/><path stroke-width=".179" stroke="#605f5f" stroke-miterlimit="10" fill="none" d="m5.089 2.857v4.464"/><g opacity=".09"><path d="m106 524c0 1.104-.896 2-2 2h-28c-1.104 0-2-.896-2-2v-20c0-1.104.896-2 2-2h28c1.104 0 2 .896 2 2v20" fill="#fff" transform="matrix(.17857 0 0 .17857-11.07-86.25)"/></g><g fill="#f9f9f9"><path d="m3.036 2.857h2.143v4.464h-2.143z"/><path d="m5.179 2.857h1.786v4.464h-1.786z"/></g></g><g id="temperature_type"><path d="m5.806 5.457v-2.945c0-.395-.321-.716-.716-.716-.395 0-.716.321-.716.716v2.945c-.298.223-.477.573-.477.955 0 .658.535 1.194 1.194 1.194s1.194-.535 1.194-1.194c0-.381-.179-.732-.477-.955m-.716 1.83c-.483 0-.875-.392-.875-.875 0-.34.194-.635.477-.78v-3.12c0-.22.178-.398.398-.398s.398.178.398.398v3.12c.283.145.477.439.477.78 0 .483-.392.875-.875.875" fill="#605f5f"/></g><g id="user"><path d="m4.291 2.353c1.281 0 2.319-1.301 2.319-2.906 0-1.605-1.038-2.906-2.319-2.906s-2.319 1.301-2.319 2.906c0 1.605 1.038 2.906 2.319 2.906-2.647 0-4.814 1.847-5 4.188h10c-.186-2.341-2.353-4.188-5-4.188"/></g><g id="write"><g transform="matrix(.10837 0 0 .1001-1.279.022)"><path d="m81.902 11.08h-63.813c-3.478 0-6.288 2.936-6.288 6.561v75.47c0 3.625 2.811 6.562 6.288 6.562h63.813c3.477 0 6.29-2.938 6.29-6.562v-75.47c0-3.624-2.813-6.561-6.29-6.561m.755 79.01s.173 1.517-.537 2.303c-.721.8-2.055.691-2.055.691l-60.709.032s-.856-.013-1.509-.762c-.564-.646-.557-2.02-.557-2.02l.022-70.43s0-1.043.611-1.6c.659-.602 1.612-.653 1.612-.653h60.721s1.151-.032 1.689.519c.732.749.71 1.536.71 1.536v70.38z"/><path d="m37.19 32.05h35.439v3.151h-35.439z"/><path d="m26.04 43.29v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.51h5.514v5.51h-5.514"/><path d="m37.19 47.01h35.439v3.15h-35.439z"/><path d="m37.19 61.36h35.439v3.15h-35.439z"/><path d="m37.19 75.36h35.439v3.149h-35.439z"/><path d="m26.04 28.324v7.875h7.876v-7.875h-7.876m1.18 6.682v-5.509h5.514v5.509h-5.514"/><path d="m26.04 57.636v7.874h7.876v-7.874h-7.876m1.18 6.682v-5.511h5.514v5.511h-5.514"/><path d="m26.04 71.64v7.874h7.876v-7.874h-7.876m1.18 6.681v-5.51h5.514v5.51h-5.514"/><g><path d="m55.722 2.298c0 1.392-1.254 2.519-2.799 2.519h-5.596c-1.546 0-2.799-1.127-2.799-2.519 0-1.39 1.253-2.518 2.799-2.518h5.596c1.545 0 2.799 1.128 2.799 2.518"/><path d="m62.11 7.748c0-1.458-.134-3.888-1.324-3.888h-21.546c-1.113 0-1.38 2.44-1.362 3.883l24.23.005"/><path d="m67.31 12.798c0-2.084-.191-5.556-1.891-5.556h-30.78c-1.592 0-1.972 3.488-1.947 5.549l34.618.007"/></g></g><path d="m6.852 7.172v-.697h-2.271-2.271v-1.17-1.17h2.271 2.271l.004-.695.004-.695 1.549 1.279c1.197.989 1.34 1.151 1.528 1.306-.024.032-3.061 2.539-3.076 2.539-.005 0-.01-.314-.01-.697z" stroke="#0000bf" stroke-width=".045" fill="#3a88ff"/></g></defs></svg>';

    // Helpers
    // -------
    
    // Throw an error *message*.
    // The `message` can be formatted with extra arguments given by `args`.
    //
    //     throwError('some {error} with {stack}', { error: e, stack: e.stack });
    function throwError(message, args) {
        var error = new Error(_.template(message, args || {}, { interpolate: /\#\{(.+?)\}/g }));
        error.name = 'Error';
        throw error;
    }
    
    // Sluggify a `text`.
    // This function replaces spaces by `-` and remove all non ascii characters.
    function sluggify(text) {
        return String(text).toLowerCase().replace(RegExp(" ", "g"), "-").replace(/[^\w-]+/g, "")
    }
    
    // Parse boolean from a string or a boolean.
    // Leading whitespaces in the string are ignored.
    function parseBoolean(string) {
        return /^true$/i.test(string);
    }
    
    // Ensure that some property of path `propertyPath` is defined in `object` and not empty.
    // If a `value` is provided as third arguments then it also checked that the value
    // referred by `propertyPath` is equal to `value`.
    function ensure(object, propertyPath /*, value */) {
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
    
    // Check if `object` is missing some (sub)property referenced by `propertyPath`.
    function missing(object, propertyPath) {
        return !ensure(object, propertyPath);
    }
    
    // Deep version of lodash _.defaults
    var defaultsDeep = _.partialRight(_.merge, function recursiveDefaults ( /* ... */ ) {
        // Ensure dates and arrays are not recursively merged
        if (_.isArray(arguments[0]) || _.isDate(arguments[0])) {
            return arguments[0];
        }
        return _.merge(arguments[0], arguments[1], recursiveDefaults);
    });
    
    // Trigger an event and/or a corresponding method name (@copyright Marionette.triggerMethod).
    // - `this.triggerMethod('foo')` will trigger the 'foo' event and
    // call the 'onFoo' method.
    // - `this.triggerMethod('foo:bar')` will trigger the 'foo:bar' event and
    // call the 'onFooBar' method.
    Debugger.triggerMethod = (function () {
    
        // Split the event name on the ':'
        var splitter = /(^|:)(\w)/gi;
    
        // Take the event section ('section1:section2:section3')
        // and turn it in to uppercase name
        function getEventName(match, prefix, eventName) {
            return eventName.toUpperCase();
        }
    
        // Actual triggerMethod implementation
        var triggerMethod = function (event) {
            // get the method name from the event name
            var methodName = 'on' + event.replace(splitter, getEventName);
            var method = this[methodName];
            var result;
    
            // Call the onMethodName if it exists
            if (_.isFunction(method)) {
                // pass all arguments, except the event name
                result = method.apply(this, _.tail(arguments));
            }
    
            // Trigger the event, if a trigger method exists
            if (_.isFunction(this.trigger)) {
                this.trigger.apply(this, arguments);
            }
    
            return result;
        };
    
        return triggerMethod;
    })();
    
    // SmartBuffer
    // -----------
    
    // The SmartBuffer can buffer data intelligently using various techniques:
    // - standard (default) - behave like a standard queue
    // - pairing - pair buffered data two by two
    // - shadowing - shadow last element when needed
    // - ignoreData - just keep timestamp and ignore data
    Debugger.SmartBuffer = (function () {
    
        // Create a new smart buffer model with the specified options.
        // By default `pairing`, `shadowing` and `ignoreData` are all set to `false`.
        var SmartBuffer = function (options) {
            this._buffer = [];
            this.options = defaultsDeep({}, options, {
                pairing: false,
                shadowing: false,
                ignoreData: false
            });
        };
    
        // Attach all inheritable methods to the SmartBuffer prototype.
        _.extend(SmartBuffer.prototype, {
    
            // Concat `bulk` data.
            concat: function (bulk) {
                _.each(bulk, function (f) {
                    this.push.apply(this, f);
                }, this);
            },
    
            // Push new `data` with given `timestamp`.
            push: function (timestamp, data) {
                // In case we just keep track of the timestamp.
                if (this.options.ignoreData) {
                    this._buffer.push({
                        timestamp: timestamp
                    });
                    return;
                }
    
                // Return if buffer is empty and data is undefined.
                if (_.isEmpty(this._buffer) && _.isUndefined(data)) {
                    return;
                }
    
                if (this.options.pairing) {
                    if (data !== undefined && _.isEmpty(this._buffer)) {
                        // If buffer is empty just push the new data.
                        this._buffer.push({
                            timestamp: timestamp,
                            data: data,
                            next: this.options.shadowing? {
                                timestamp: timestamp,
                                data: data
                            } : null
                        });
                    } else if (data !== undefined) {
                        // Set previous.next.
                        this._buffer[this.size() - 1].next = {
                            timestamp: timestamp,
                            data: data
                        };
                        // Push a new frame.
                        this._buffer.push({
                            timestamp: timestamp,
                            data: data,
                            next: this.options.shadowing? {
                                timestamp: timestamp,
                                data: data
                            } : null
                        });
                    } else if (this.options.shadowing)  {
                        // If shadowing then update shadow timestamp.
                        this._buffer[this.size() - 1].next.timestamp = timestamp;
                    }
                } else /* pairing is not activated */ {
                    if (data !== undefined && this._lastIsShadow) {
                        // Replace shadow by new frame if shadowing is activated. #
                        this._buffer[this.size() - 1] = {
                            timestamp: timestamp,
                            data: data
                        };
                        // Last is not a shadow anymore.
                        this._lastIsShadow = false;
                    } else if (data !== undefined && this._lastIsShadow) {
                        // Update shadow timestamp if shadowing is activated
                        this._buffer[this.size() - 1].timestamp = timestamp;
                    } else if (data !== undefined) {
                        // Push new data
                        this._buffer.push({
                            timestamp: timestamp,
                            data: data
                        });
                    } else if (this.options.shadowing) {
                        // Push a shadow if shadowing is activated.
                        this._buffer.push({
                            timestamp: timestamp,
                            data: this._buffer[this.size() - 1].data
                        });
                        // Make last a shadow.
                        this._lastIsShadow = true;
                    }
                }
            },
    
            // Get all data from the buffer.
            all: function () {
                return this._buffer;
            },
    
            // Get first item from the buffer.
            first: function() {
                return _.first(this._buffer);
            },
    
            // Get last item from the buffer.
            last: function() {
                return _.last(this._buffer);
            },
    
            // Select and return a subset of items matching some `predicate`.
            select: function (predicate) {
                return _.filter(this._buffer, predicate);
            },
    
            // Return a subset of items not matching some `predicate`.
            reject: function (predicate) {
                return _.reject(this._buffer, predicate);
            },
    
            // Return the domain covered by this buffer where date in the domain are formatted according to `dateFn`.
            domain: function (dateFn) {
                if (_.isUndefined(this._buffer)) return null;
    
                dateFn || (dateFn = function (d) {
                    return d;
                });
    
                var min = this._buffer[0];
                var max = _.max(this._buffer, function (d) {
                    return d.next ? d.next.timestamp : d.timestamp
                });
    
                return [dateFn(min.timestamp), dateFn(max.next ? max.next.timestamp : max.timestamp)];
            },
    
            // Return a frame from buffered data that match a given `timestamp`.
            // If no match found then `null` is returned.
            at: function (timestamp) {
                if (this.options.pairing) {
                    return _.findLast(this._buffer, function (frame) {
                        return frame.timestamp <= timestamp && timestamp <= frame.next.timestamp;
                    });
                } else {
                    return _.findLast(this._buffer, function (frame) {
                        return frame.timestamp == timestamp;
                    });
                }
            },
    
            // Return a frame inside a timestamp `range`, if multiple frames match then the one
            // closest to the boundary on the `direction` side will be returned.
            // If no match found then `null` is returned.
            inside: function (range, direction) {
                // The lookup function depends on the lookup direction
                var lookup = direction == 'left' ? _.find : _.findLast;
    
                if (this.options.pairing) {
                    return lookup.call(this, this._buffer, function (frame) {
                        return (range[0] <= frame.timestamp && frame.timestamp <= range[1])
                            || (frame.next && range[0] <= frame.next.timestamp && frame.next.timestamp <= range[1])
                            || (frame.timestamp <= range[0] && frame.next && range[1] <= frame.next.timestamp);
                    });
                } else {
                    return lookup.call(this, this._buffer, function (frame) {
                        return range[0] <= frame.timestamp && frame.timestamp <= range[1];
                    });
                }
            },
    
            // Return size of the buffer.
            size: function () {
                return this._buffer.length;
            },
    
            // Clear the buffer.
            clear: function() {
                // We don't use this._buffer = [] here cause there can be other references
                // to this array in the code.
                while(this._buffer.length > 0) {
                    this._buffer.pop();
                }
            }
        });
    
        return SmartBuffer;
    })();
    // Logger
    // ------
    
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
    
    // Define default logger.
    // The default logger output to the console.
    Debugger.logger = new Logger(console);
    // Events.
    
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

    // Connector
    // ---------
    
    // Create a new Connector with the specified options.
    Debugger.Connector = function (options) {
        // Check supports for WebSocket
        if (!WebSocket) {
            throwError('WebSocket is not supported.');
        }
    
        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
    };
    
    // Attach all inheritable methods to the Connector prototype.
    _.extend(Debugger.Connector.prototype, Backbone.Events, {
    
        // Initialize the connector with given `options`.
        initialize: function (options) {
            // Set default options in case some is omitted
            this.options = defaultsDeep(options || {}, {
                address: 'localhost',
                port: 8987,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 5000
            });
    
            this._connectionAttempted = 0;
            this._requestsQueue = [];
            this._initiate_connection();
        },
    
        // Request livetrace from the AppsGate server.
        requestLiveTrace: function() {
            return this._exec({
                name: 'livetrace'
            });
        },
    
        // Request historytrace from the AppsGate server with given `params`.
        requestHistoryTrace: function(params) {
            var now = Date.now();
    
            params = _.defaults({}, params, {
                from: now - 24*3600*1000,
                to: now,
                withEventLine: false,
                screenResolution: 930,
                selectorResolution: 10,
                brushResolution: 930,
                order: 'type'
            });
    
            return this._exec({
                name: 'historytrace',
                args: params
            });
        },
    
        // Request initial history trace.
        // The initial history trace is an history trace along with
        // its associated event line.
        requestInitialHistoryTrace: function(params) {
            return this.requestHistoryTrace(defaultsDeep({withEventLine: true}, params));
        },
    
        // Check if connection is persistent.
        isPersistent: function () {
            return this.options.reconnection;
        },
    
        // Attempt a new connection.
        tryReconnection: function () {
            return this.options.reconnection && this._connectionAttempted < this.options.reconnectionAttempts;
        },
    
        // **Private API**
    
        // Internal method to initiate socket connection.
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
                    self._execLastPendingRequestAndDropOthers();
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
                        // Notify user.
                        Debugger.logger.info("Schedule socket reconnection in #{delay}ms (attempt n°#{attempts})", {
                                attempts: self._connectionAttempted,
                                delay: self.options.reconnectionDelay}
                        );
                        // Reschedule connection.
                        setTimeout(function () {
                            self._initiate_connection()
                        }, self.options.reconnectionDelay);
                    }
                },
                onmessage: function (message) {
                    try {
                        var unpacked = self._unpackMessage(message.data);
                        self.trigger('packet:received', unpacked);
                    } catch (e) {
                        throwError('Skip message "#{message}" due to error #{error}', {
                            message: message,
                            error: e
                        });
                    }
                }
            });
        },
    
        // Internal methods for executing last pending request and drop the others
        _execLastPendingRequestAndDropOthers: function() {
            if (!_.isEmpty(this._requestsQueue)) {
                var last = _.last(this._requestsQueue);
                _.forEach(this._requestsQueue, function(request) {
                    Debugger.logger.info("Dropping old request #{request} from pending queue", {
                        request: JSON.stringify(request)
                    });
                });
                this._clearRequestsQueue();
                this._exec(last);
            }
        },
    
        // Internal method for executing a `request`.
        // In case the socket is not OPEN the request will
        // be appended to the requestsQueue to be executed later.
        _exec: function(request) {
            if (this.socket.readyState == WebSocket.OPEN) {
                Debugger.logger.info("Executing request #{request}", {
                    request: JSON.stringify(request)
                });
                this.socket.send(JSON.stringify(request));
                return true;
            } else {
                Debugger.logger.info("Postpone request #{request}", {
                    request: JSON.stringify(request)
                });
                this._requestsQueue.push(request);
                return false;
            }
        },
    
        // Clear all pending requests.
        _clearRequestsQueue: function() {
            this._requestsQueue = [];
        },
    
        // Unpack message into a {request, data, groups} object.
        // Depending on the received message, value in the return object might be null.
        _unpackMessage: function(message) {
            var answer = JSON.parse(message);
            if (_.isObject(answer) && _.has(answer, 'request')) {
                return {
                    request: answer.request,
                    data: answer.result.data,
                    eventline: answer.result.eventline,
                    groups: answer.result.groups
                };
            } else {
                return {
                    request: null,
                    data: answer,
                    eventline: null,
                    groups: null
                };
            }
        },
    
        // Import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Debugger.triggerMethod,
    
        // Destroy the connector properly
        destroy: function () {
            var args = Array.prototype.slice.call(arguments);
            this.triggerMethod.apply(this, ['before:destroy'].concat(args));
            this.triggerMethod.apply(this, ['destroy'].concat(args));
    
            this.stopListening();
            this.off();
            this.socket.close();
        }
    });
    

    // Developer Tools
    // ---------------
    
    
    // Create a new Monitor with the specified options.
    Debugger.Monitor = function (options) {
        _.bindAll(this, 'update');
    
        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
    };
    
    // Attach all inheritable methods to the Monitor prototype.
    _.extend(Debugger.Monitor.prototype, Backbone.Events, {
    
        // Initialize monitor.
        initialize: function (options) {
            // Set default options
            this.options = defaultsDeep(options || {}, {
                id: _.uniqueId('monitor')
            });
    
            this._init_ui();
        },
    
        // Initialize UI.
        _init_ui: function (selector) {
            this.$el = $('<div/>')
                .attr({
                    id: this.options.id
                })
                .addClass('monitor')
                .css({
                    position: 'fixed',
                    bottom: '0px',
                    width: '100%',
                    height: '30px',
                    zindex: '1000000',
                    background: 'white'
                });
            $('body').append(this.$el);
    
            // setup the monitor
            this._$status = $('<div/>')
                .addClass('status')
                .css({
                    float: 'right',
                    'padding-right': '10px',
                    'line-height': '30px',
                    'text-align': 'center'
                });
            this.$el.append(this._$status);
        },
    
        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be preferred to global lookups where possible.
        $: function (selector) {
            return this.$el.find(selector);
        },
    
        // Connect the monitor to a `connector`.
        connect: function (connector) {
            if (this.connector) {
                // Unregister if already registered.
                Debugger.logger.warn("Monitor connection reinitialized: the monitor was already connected to a connector.");
                this.connector.off('frame:received', this.update);
            }
    
            // Register to `connector` events.
            this.connector = connector;
            this.connector.on('frame:received', this.update);
    
            return this;
        },
    
        // Update monitor state.
        update: function (frame) {
            this._$status.text(frame.timestamp);
        },
    
        // Import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Debugger.triggerMethod
    });
    
    // Dashboard
    // ---------
    
    // AppsGate **Dashboard** is the central element of the AppsGate Debugger.
    
    // Create a new Dashboard with the specified `options` and append it to the given `selector`.
    Debugger.Dashboard = function (selector, options) {
        // check if selector is given
        if (!selector) {
            throwError('You must specify a selector to create a Dashboard.');
        }
    
        _.bindAll(this, 'onPacketReceived');
    
        this._groups = {};
        this._devices = {};
        this._programs = {};
    
        // keep track of time domain, this is required when adding dynamically new
        // devices or programs in order to sync their timescale.
        this._domain = [_.now(), 0];
    
        if (_.isFunction(this.initialize)) {
            this.initialize(selector, options);
        }
    };
    
    // Attach all inheritable methods to the Dashboard prototype.
    _.extend(Debugger.Dashboard.prototype, Backbone.Events, {
    
        // Initialize the dashboard.
        initialize: function (selector, options) {
            this.options = defaultsDeep({}, options, {
                width: 960,
                widget: {
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
                group: {
                    height: 60
                },
                ruler: {
                    width: 30
                }
            });
    
            this._init_ui(selector);
            this._init_d3();
            this._clean();
        },
    
        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be preferred to global lookups where possible.
        $: function (selector) {
            return this.$el.find(selector);
        },
    
        // Import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Debugger.triggerMethod,
    
        //Connect the dashboard to a `connector`.
        connect: function (connector) {
            if (this.connector) {
                // Unregister if already registered.
                Debugger.logger.warn("Dashboad connection reinitialized: the dashboad was already connected to a connector.");
                this.connector.off('packet:received', this.update);
            }
    
            // Register to `connector` events
            this.connector = connector;
            this.connector.on('packet:received', this.onPacketReceived);
    
            return this;
        },
    
        // Update dashboard with new data. This is generally called by the connected
        // connector when new data are received.
        onPacketReceived: function(packet) {
            try {
                if (packet.request) {
                    var updateFocusLine = false;
    
                    if (packet.eventline) {
                        // Reset the dashboard on each request.
                        this._reset();
    
                        // Update focusline with received data.
                        // note: here we prevent rendering except for the last frame
                        var lastFrame = packet.eventline.pop();
    
                        _.each(packet.eventline, function (frame) {
                            this._update_focusline_with_frame(frame, {render: false});
                        }, this);
    
                        if (lastFrame) {
                            this._update_focusline_with_frame(lastFrame);
                        }
                    } else {
                        // Reset the dashboard on each request
                        // this will not clean the focusline.
                        this._clean();
                    }
    
                    // Set the default group demux.
                    if (packet.groups) {
                        this._demux = this._create_demux({grouping: packet.groups});
                    }
    
                    // Update widgets with received data.
                    var lastFrame = packet.data.pop();
    
                    _.each(packet.data, function (frame) {
                        this._update_all_with_frame(frame, {render: false});
                    }, this);
    
                    if (lastFrame) {
                        this._update_all_with_frame(lastFrame);
                    }
    
                    // Update widgets according to ruler
                    this._notifyWidgetsOfRulerPosition();
                } else {
                    // This is a streaming packet
                    var data = packet.data;
                    if (data instanceof Array) {
                        // Update widgets with received data.
                        // note: here we prevent rendering except for the last frame
                        var lastFrame = data.pop();
    
                        _.each(data, function (frame) {
                            this._update_focusline_with_frame(frame, {render: false});
                            this._update_all_with_frame(frame, {render: false});
                        }, this);
    
                        if (lastFrame) {
                            this._update_focusline_with_frame(lastFrame);
                            this._update_all_with_frame(lastFrame);
                        }
                    } else {
                        this._update_focusline_with_frame(data);
                        this._update_all_with_frame(data);
                    }
    
                    // Update widgets according to ruler.
                    this._notifyWidgetsOfRulerPosition();
                }
            } catch (e) {
                Debugger.logger.error('Error when processing packet `#{packet}`. #{error} #{stacktrace}', {
                    packet: packet,
                    error: e,
                    stacktrace: e.stack
                });
            }
        },
    
        // Request initial history trace.
        requestInitialHistoryTrace: function(params) {
            params = _.defaults({}, params, {
                order: 'type'
            });
    
            if (this.connector) {
                this.connector.requestInitialHistoryTrace({
                    screenResolution: this._focusline.computed('svg.width'),
                    selectorResolution: this.options.ruler.width,
                    brushResolution: this._focusline.computed('svg.width'),
                    order: params.order
                })
            }
        },
    
        // Request history trace.
        requestHistoryTrace: function(params) {
            params = _.defaults({}, params, {
                order: 'type',
                brushResolution: this._focusline.computed('svg.width')
            });
    
            if (this.connector) {
                this.connector.requestHistoryTrace({
                    screenResolution: this._focusline.computed('svg.width'),
                    selectorResolution: this.options.ruler.width,
                    brushResolution: params.brushResolution,
                    order: params.order
                })
            }
        },
    
        //  Request live trace.
        requestLiveTrace: function() {
            if (this.connector) {
                this.connector.requestLiveTrace();
            }
        },
    
        // **Private API**
    
        // Initialize the UI within the container designated by the `selector`.
        _init_ui: function (selector) {
            var self = this;
    
            // Create the ruler.
            this._$ruler = $('<div class="rule"><div class="line"></div></div>')
                .css({
                    'width': this.options.ruler.width,
                    'margin-left': this.options.widget.placeholder.sidebar.width
                });
    
            // Create the footer.
            this._$footer = $('<footer></footer>');
    
            // Create the widgets holder
            this._$container = $('<div class="container"></div>');
    
            // Setup the dashboard.
            this.$el = $(selector).css({
                width: parseInt(this.options.width) + "px"
            }).addClass('dashboard').append(this._$ruler, this._$container, this._$footer);
    
            // Make the ruler draggable.
            this._$ruler.draggable({
                axis: 'x',
                containment: 'parent',
                start: function(event, ui) {
                    this.lastPosition = ui.position;
                },
                drag: function (event, ui) {
                    var direction = (this.lastPosition.left > ui.position.left) ? 'left' : 'right';
                    self._notifyWidgetsOnRulerFocusChanged(ui.position, direction);
                    this.lastPosition = ui.position;
                }
            });
        },
    
        // Initialize D3
        _init_d3: function () {
            // Define main timescale.
            this.timescale = d3.time.scale().range([0, this.options.with]);
    
            // Create focusline.
            this._focusline = new Debugger.Widgets.Focusline({id: 'default'}, {
                height: 20,
                placeholder: this.options.widget.placeholder
            });
    
            // Bind dashboard to its events.
            this.listenTo(this._focusline, 'focus:change', this._onFocusChange);
            this.listenTo(this._focusline, 'brush:resize', this._onBrushResize);
    
            // Attach it to the dashboard.
            this._attach_widget(this._focusline, this._$footer);
        },
    
        // Reset dashboard to its initial state.
        _reset: function() {
            // Clean groups, devices, programs.
            this._clean();
    
            this._devices = {};  // reset devices
            this._programs = {}; // reset programs
    
            // Reset focusline and domain.
            this._focusline.reset();
            this._domain = [_.now(), 0];
        },
    
        // Clean dashboard. Cleaning the dashboard will (a) clean and detach all widgets but
        // the focusline and (b) destroy all groups.
        _clean: function() {
            // Detach devices.
            _.forEach(this._devices, function(widget) {
                this._detach_widget(widget);
            }, this);
    
            // Detach programs.
            _.forEach(this._programs, function(widget) {
                this._detach_widget(widget);
            }, this);
    
            // Remove groups.
            _.forEach(this._groups, function(group) {
                this._remove_group(group);
            }, this);
    
            // Reset groups.
            this._groups = {};
    
            // Set default group demultiplexer (demux).
            this._demux = this._create_demux({ func: 'type' });
        },
    
        // Focus change callback.
        _onFocusChange: function() {
            this._notifyWidgetsOnRulerFocusChanged(this._$ruler.position());
        },
    
        // Brush resize callback.
        _onBrushResize: function(width) {
            this.triggerMethod.apply(this, ['zoom:request'].concat([{
                screenResolution: this._focusline.computed('svg.width'),
                selectorResolution: 10,
                brushResolution: width
            }]));
        },
    
        // Widget marker click callback.
        // `decorations` is an array of decorations associated to the marker.
        _onWidgetMarkerClick: function(decorations) {
            var textContent = '';
            var htmlContent = '';
    
            // Build basic string representation of `decorations` array
            // both as plain text and HTML.
            _.each(_.sortBy(decorations, function(decoration) { return parseInt(decoration.order) }), function(decoration) {
                textContent += decoration.description + '\n';
                htmlContent += decoration.description + '</br>';
            });
    
            // Trigger `marker:click` event with following arguments:
            // - decorations: Arrays - list of decorations associated to the marker
            // - textContent: String - concatenations of all decorations to plain text
            // - htmlContent: String - concatenations of all decorations to HTML
            this.triggerMethod.apply(this, ['marker:click'].concat([decorations, textContent, htmlContent]));
        },
    
        // Notify widgets of the position of the ruler.
        _notifyWidgetsOfRulerPosition: function() {
            this._notifyWidgetsOnRulerFocusChanged(this._$ruler.position());
        },
    
        // Notify widgets that the ruler is at some `position` and dragged into some `direction`.
        // Direction can be 'left' or 'right'
        _notifyWidgetsOnRulerFocusChanged: function(position, direction) {
            /* offset = parent.offset.left - ruler.width/2 */
            var offset = this.$el.offset().left - this.options.ruler.width / 2;
            _.invoke(this._devices, 'rulerFocusChanged', position.left - offset, direction || 'left');
            _.invoke(this._programs, 'rulerFocusChanged', position.left - offset, direction || 'left');
        },
    
        // Update focusline.
        _update_focusline_with_frame: function(frame, options) {
            // Update domain.
            this._domain = [Math.min(this._domain[0], frame.timestamp), Math.max(this._domain[1], frame.timestamp)];
    
            // Update focusline.
            this._focusline.update({
                timestamp: frame.timestamp,
                frame: {
                    value: frame.value? frame.value : _.size(frame.devices) + _.size(frame.programs)
                }
            }, this._domain, options);
        },
    
        // Update all widgets attached to the dashboard according to some `frame` data.
        _update_all_with_frame: function (frame, options) {
            // Update focus
            this._focus = this._focusline.brush.empty()? this._domain : this._focusline.brush.extent();
    
            //
            // Update *Devices*.
            //
    
            var updated_device_ids = [];
    
            // update devices listed in frame
            _.forEach(frame.devices, function (update) {
                // Create device if it does not exit yet.
                if (!this._has_widget('device', update.id)) {
                    this._create_widget('device', update);
                }
    
                // Update it.
                this._update_one_with_frame('device', update.id, {
                    timestamp: frame.timestamp,
                    frame: update
                }, options);
    
                // Mark as updated.
                updated_device_ids.push(update.id);
            }, this);
    
            // Update all other devices (timestamp only).
            _.forEach(this._devices, function (device, device_id) {
                if (!_.contains(updated_device_ids, device_id)) {
                    this._update_one_with_frame('device', device_id, {timestamp: frame.timestamp}, options);
                }
            }, this);
    
            //
            // Update *Programs*.
            //
    
            var updated_program_ids = [];
    
            // Update devices listed in frame.
            _.forEach(frame.programs, function (update) {
                // Create program if it does not exit yet.
                if (!this._has_widget('program', update.id)) {
                    this._create_widget('program', update);
                }
    
                // Update it.
                this._update_one_with_frame('program', update.id, {
                    timestamp: frame.timestamp,
                    frame: update
                }, options);
    
                // Mark as updated.
                updated_program_ids.push(update.id);
            }, this);
    
            // Update all other programs (timestamp only).
            _.forEach(this._programs, function (program, program_id) {
                if (!_.contains(updated_program_ids, program_id)) {
                    this._update_one_with_frame('program', program_id, {timestamp: frame.timestamp}, options);
                }
            }, this);
    
            //
            // Update *Groups*/
            //
            _.forEach(this._groups, function (group) {
               group.timeline.update({
                   timestamp: frame.timestamp
               }, this._focus, options);
            }, this);
        },
    
        // Update a `what` (e.g. 'program', 'device') widget with id `id` according to some `frame` data.
        _update_one_with_frame: function (what, id, frame, options) {
            if (this._has_widget(what, id)) {
                var widget = what === 'device' ? this._devices[id] : this._programs[id];
    
                // Attach the widget to its group if not attached
                if (widget.isDetached()) {
                    this._attach_widget_to_group(widget);
                }
    
                widget.update(frame, this._focus, options);
            }
        },
    
        // Check whether a `what` widget with id `id` exists.
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
    
        // Create a group demultiplexer function from given `attributes`.
        _create_demux: function(attributes) {
            if (attributes && attributes.func) {
                switch (attributes.func) {
                    case 'type': return function(item) {
                        return item.type? 'Devices' : 'Programs'
                    };
                    default: return function(item) {
                        return 'Unknown'
                    };
                }
            } else if (attributes && attributes.grouping) {
                return (function() {
                    var grouping = attributes.grouping;
    
                    return function(item) {
                        var group = _.find(grouping, function(group) {
                            return _.indexOf(group.members, item.id) !== -1;
                        });
    
                        if (group) {
                            return group.name;
                        } else {
                            return 'Unknown';
                        }
                    };
                })();
            } else {
                return function(item) {
                    return 'Unknown';
                };
            }
        },
    
        // Create a new group with given `attributes`.
        _create_group: function(attributes) {
            // Widget options.
            var options = {
                width: this.options.width,
                height: this.options.group.height,
                margin: this.options.widget.margin,
                placeholder: this.options.widget.placeholder,
                ruler: this.options.ruler
            };
    
            // Create timeline for the group.
            var timeline = new Debugger.Widgets.Timeline({
                id: _.uniqueId('timeline'),
                name: attributes.name,
                orientation: 'bottom'
            }, options);
    
            // Bind to focusline.
            if (_.isFunction(timeline.onFocusChange)) {
                timeline.listenTo(this._focusline, 'focus:change', timeline.onFocusChange);
            }
    
            var group = $('<div/>')
                .attr({
                    id: _.uniqueId('group'),
                    class: 'group'
                })
                .append('<header/>')
                .append('<div class="container"></div>');
    
            // Attach group to the dashboard.
            this._$container.append(group);
    
            // Attach timeline to the group.
            this._attach_widget(timeline, group.find('header')[0]);
    
            // Return group object.
            return {
                $el: group,
                $container: group.find('.container')[0],
                timeline: timeline
            };
        },
    
        // Remove a group from the dashboard.
        _remove_group: function(group) {
            // Detach timeline.
            this._detach_widget(group.timeline);
    
            // Remove the group $el.
            group.$el.remove();
    
            // Delete group.
            delete group.$el;
            delete group.$container;
            delete group.timeline;
        },
    
        // Create a new `what` widget with given `attributes`.
        _create_widget: function (what, attributes) {
            var widget = undefined;
    
            // Define widget options.
            var options = {
                width: this.options.width,
                height: this.options.widget.height,
                margin: this.options.widget.margin,
                placeholder: this.options.widget.placeholder,
                ruler: this.options.ruler
            };
    
            switch (what) {
                case 'program':
                    widget = new Debugger.Widgets.Program({id: attributes.id}, options);
                    break;
                case 'device':
                    switch (attributes.type) {
                        case 'Temperature':
                            widget = new Debugger.Widgets.Temperature({
                                id: attributes.id,
                                type: attributes.type
                            }, options);
                            break;
                        case 'Switch':
                            widget = new Debugger.Widgets.Switch({
                                    id: attributes.id,
                                    type: attributes.type
                                }, options);
                            break;
                        case 'Contact':
                            widget = new Debugger.Widgets.Contact({
                                    id: attributes.id,
                                    type: attributes.type
                                }, options);
                            break;
                        case 'KeyCardSwitch':
                            widget = new Debugger.Widgets.KeycardSwitch({
                                    id: attributes.id,
                                    type: attributes.type
                                }, options);
                            break;
                        case 'SmartPlug':
                            widget = new Debugger.Widgets.SmartPlug({
                                    id: attributes.id,
                                    type: attributes.type
                                }, options);
                            break;
                        case 'ColorLight':
                            widget = new Debugger.Widgets.ColorLight({
                                    id: attributes.id,
                                    type: attributes.type
                                }, options);
                            break;
                    }
                    break;
            }
    
            if (widget) {
                // Keep track of new created widget.
                switch (what) {
                    case 'device':
                        this._devices[attributes.id] = widget;
                        break;
                    case 'program':
                        this._programs[attributes.id] = widget;
                        break;
                }
    
                // Bind to focusline.
                if (_.isFunction(widget.onFocusChange)) {
                    widget.listenTo(this._focusline, 'focus:change', widget.onFocusChange);
                }
    
                // Bind dashboard to widget events.
                this.listenTo(widget, 'marker:click', this._onWidgetMarkerClick);
    
                // Find and attach it to the group to which it belongs.
                var groupName = this._demux(attributes);
                this._attach_widget_to_group(widget);
            } else {
                Debugger.logger.error('Unable to create device of type #{type}', attributes);
            }
    
            return widget;
        },
    
        // Attach a widget to a group within this dashboard.
        // If the group if not created then it creates the group first.
        _attach_widget_to_group: function(widget, group) {
            // If group is not provided then find it from widget attributes.
            if (_.isUndefined(group)) {
                group = this._demux(widget.attributes);
            }
    
            // If group is not created then create it.
            if (_.isUndefined(this._groups[group])) {
                this._groups[group] = this._create_group({
                    name: group
                });
            }
    
            // Attach it to the group in the DOM.
            this._attach_widget(widget, this._groups[group].$container);
        },
    
        // Attach a widget to a target element within this dashboard.
        // If multiple elements match the target then the widget is appended to the first found.
        _attach_widget: function (widget, target) {
            if (this.$(widget.el).length > 0) {
                throwError("Widget #{widget} already attached to dashboard.", { widget: widget});
            }
    
            if (target) {
                this.$(target).first().append(widget.$el);
            } else {
                this._$container.append(widget.$el);
            }
    
            this.triggerMethod.apply(widget, ['attached'].concat(this.$el));
        },
    
        // Detach a widget from this dashboard.
        _detach_widget: function(widget) {
            var parent = widget.$el.parent();
    
            this.triggerMethod.apply(widget, ['detached'].concat(parent));
    
            widget.$el.remove();
        }
    });
    
    // Widgets
    // -------
    
    // AppsGate **Widgets** are the base elements of the AppsGate Dashboard.
    
    // Define `Debugger.Widgets` namespace.
    var Widgets = Debugger.Widgets = {};
    
    // Create a new Widget with the specified attributes.
    Widgets.Widget = function (attributes, options) {
        var self = this;
    
        this.attributes = defaultsDeep({}, attributes || {}, _.result(this, 'defaults'));
    
        // Check if an *id* and a *kind* is given
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
    
    // Attach all inheritable methods to the Widget prototype.
    _.extend(Widgets.Widget.prototype, Backbone.Events, {
    
        // Initialize widget with default options.
        initialize: function (options) {
            var self = this;
    
            // set default options in case some is omitted
            this.options = defaultsDeep({}, options, {
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
    
            // Compute expressions
            this.compute('svg.width', 'this.options.width - this.options.placeholder.sidebar.width - this.options.margin.left - this.options.margin.right');
            this.compute('svg.height', 'this.options.height - this.options.margin.top - this.options.margin.bottom');
    
            this._initUI();
        },
    
        // Internal handler triggered when a widget is attached `to` a dashboard.
        onAttached: function (to) {
            // Set ourselves as attached.
            this.isAttached = true;
    
            // Initialize D3.
            this._initD3(to);
        },
    
        // Handle `before:init:UI` event.
        onBeforeInitUI: function() { /* default implementation: do nothing */ },
    
        // Internal method to initialize the user interface.
        _initUI: function () {
            var args = Array.prototype.slice.call(arguments);
    
            // Notify that we are going to initialize UI.
            this.triggerMethod.apply(this, ['before:init:UI'].concat(args));
    
            // Create main element
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
    
            // Create `sidebar` placeholder located at the left of d3 placeholder.
            this._$sidebar = this.$('.placeholder.sidebar').css({
                'width': this.options.placeholder.sidebar.width,
                'height': this.computed('svg.height')
            });
            this._$name = $('<div/>').addClass('title').css({
                'line-height': this.computed('svg.height') + 'px'
            });
            this._$sidebar.append(this._$name);
    
            // Create `D3` placeholder (where we draw).
            this._$d3 = this.$('.placeholder.d3').css({
                'width': this.computed('svg.width'),
                'height': this.computed('svg.height')
            }).append(BASE_SVG);
    
            // Create `aside` placeholder located/floating around the ruler.
            this._$aside = this.$('.placeholder.aside').css({
                'height': this.computed('svg.height')
            });
    
            // Notify that we are initializing UI.
            this.triggerMethod.apply(this, ['init:UI'].concat(args));
        },
    
        // Handle `init:UI` event.
        onInitUI: function() { /* default implementation: do nothing */ },
    
        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be preferred to global lookups where possible.
        $: function (selector) {
            return this.$el.find(selector);
        },
    
        // Handle `before:init:D3` event.
        onBeforeInitD3: function() { /* default implementation: do nothing */ },
    
        // Internal method to initialize D3.
        _initD3: function(to) {
            var args = Array.prototype.slice.call(arguments);
    
            // Notify that we are going to initialized d3
            this.triggerMethod.apply(this, ['before:init:d3'].concat(args));
    
            // Initialize D3 SVG object.
            this.svg = d3.select(this._$d3[0]).select("svg").attr({
                'width': this.computed('svg.width'),
                'height': this.computed('svg.height')
            }).append("g");
    
            // Setup D3 functions.
            this.dateFn = function (timestamp) {
                return new Date(parseInt(timestamp))
            };
    
            // Setup D3 timescale.
            this.timescale = d3.time.scale()
                .range([0, this.computed('svg.width')]);
    
            // Notify that we are initializing d3
            this.triggerMethod.apply(this, ['init:d3'].concat(args));
        },
    
        // Handle `init:D3` event.
        onInitD3: function() { /* default implementation: do nothing */ },
    
        // Check if the widget is currently attached to a dashboard.
        isDetached: function() {
            return !this.isAttached;
        },
    
        // Internal handler triggered when a widget is detached `from` a dashboard.
        onDetached: function (from) {
            var args = Array.prototype.slice.call(arguments);
    
            // Set ourselves as detached.
            this.isAttached = false;
    
            this._destroyD3();
        },
    
        // Handle `before:destroy:D3` event.
        onBeforeDestroyD3: function() { /* default implementation: do nothing */ },
    
        // Internal handler triggered when a widget is destroyed.
        _destroyD3: function() {
            var args = Array.prototype.slice.call(arguments);
    
            // Notify that we are going to destroy d3.
            this.triggerMethod.apply(this, ['before:destroy:d3'].concat(args));
    
            // Cleanup SVG.
            this.svg.remove();
            delete this.svg;
    
            // Cleanup buffer.
            this.buffer.clear();
    
            // Notify that we are destroying d3.
            this.triggerMethod.apply(this, ['destroy:d3'].concat(args));
        },
    
        // Handle `destroy:D3` event.
        onDestroyD3: function() { /* default implementation: do nothing */ },
    
        // Handle `before:reset:D3` event.
        onBeforeResetD3: function() { /* default implementation: do nothing */ },
    
        // Reset the widget
        reset: function() {
            var args = Array.prototype.slice.call(arguments);
    
            // Notify that we are going to reset d3.
            this.triggerMethod.apply(this, ['before:reset:d3'].concat(args));
    
            this._destroyD3();
            this._initD3();
    
            // Notify that we are resetting d3.
            this.triggerMethod.apply(this, ['reset:d3'].concat(args));
        },
    
        // Handle `reset:D3` event.
        onResetD3: function() { /* default implementation: do nothing */ },
    
        // Return the value of a computed property.
        computed: function (property) {
            return this.exprs[property].value;
        },
    
        // Compute the value of a `property' given some `expression`.
        // @warning the value is not automatically recomputed.
        compute: function (property, expression) {
            this.exprs[property] = {
                expression: expression,
                value: eval(expression)
            };
    
            return this.exprs[property].value;
        },
    
        // Handle `before:frame:update` event.
        onBeforeFrameUpdate: function() { /* default implementation: do nothing */ },
    
        // Internal method to update the widget with new data.
        update: function (data, focus, options) {
            // Set default options.
            options = _.defaults({}, options, {
                render: true
            });
    
            // Build up args for callback.
            var args = Array.prototype.slice.call([data, focus, options]);
    
            // Notify that we are going to update.
            this.triggerMethod.apply(this, ['before:frame:update'].concat(args));
    
            // Collect new data.
            if (data && data.bulk) {
                this.buffer.concat(data.bulk)
            } else if (data && data.timestamp) {
                this.buffer.push(data.timestamp, data.frame);
            }
    
            // Notify that we are updating.
            this.triggerMethod.apply(this, ['frame:update'].concat(args));
    
            // Render only if required.
            if (options && options.render) {
                this.timescale.domain(focus);
                this._render();
            }
        },
    
        // Handle `frame:update` event.
        onFrameUpdate: function() { /* default implementation: do nothing */ },
    
        // Handle `before:render` event.
        onBeforeRender: function() { /* default implementation: do nothing */ },
    
        // Internal method to render the widget.
        _render: function() {
            var args = Array.prototype.slice.call(arguments);
    
            // Notify that we are going to render.
            this.triggerMethod.apply(this, ['before:render'].concat(args));
    
            // nothing to render...
    
            // Notify that we are rendering.
            this.triggerMethod.apply(this, ['render'].concat(args));
        },
    
        // Handle `render` event.
        onRender: function() { /* default implementation: do nothing */ },
    
        // Handle `before:ruler:focus:update` event.
        onBeforeRulerFocusUpdate: function() { /* default implementation: do nothing */ },
    
        // Internal method to notifying widget that the ruler's focus just changed.
        // `Position` is the position of the ruler in pixel.
        // `Direction` is the `left` or `right` direction in which the ruler was dragged.
        rulerFocusChanged: function (position, direction, options) {
    
            // Set default options.
            options = defaultsDeep({}, options, {
                delta: 2    // 2px left and 2px right
            });
    
            // Keep track of last focused frame.
            this._lastFocusedFrame = this._focusedFrame;
    
            // Get exact matching timestamp.
            var exactTimestamp = this.timescale.invert(parseInt(position)).getTime();
    
            // Get new focused frame.
            this._focusedFrame = this._findFocusedFrame(position, direction, exactTimestamp, options.delta);
    
            this.triggerMethod.apply(this, ['before:ruler:focus:update', position, exactTimestamp, this._focusedFrame, this._lastFocusedFrame]);
    
            // Update the name of his widget.
            if (ensure(this._focusedFrame, 'data.name')) {
                this._$name.text(this._focusedFrame.data.name);
            }
    
            // Hide widget if it does not have any state (meaning it disappeared).
            if (missing(this._focusedFrame, 'data.event.state')) {
                this.$el.css('opacity', 0.1);
            } else {
                this.$el.css('opacity', 1);
            }
    
            this.triggerMethod.apply(this, ['ruler:focus:update', position, exactTimestamp, this._focusedFrame, this._lastFocusedFrame]);
        },
    
        // Handle `ruler:focus:update` event.
        onRulerFocusUpdate: function() { /* default implementation: do nothing */ },
    
        // Internal method used to find the focused frame.
        _findFocusedFrame: function(position, direction, exactTimestamp, delta) {
            // Workout timestamp interval.
            var minTimestamp = this.timescale.invert(parseInt(position-delta)).getTime();
            var maxTimestamp = this.timescale.invert(parseInt(position+delta)).getTime();
    
            var focusedFrame = this.buffer.inside(
                [direction == 'left' ? minTimestamp : exactTimestamp, direction == 'right' ? maxTimestamp : exactTimestamp],
                direction
            );
    
            return focusedFrame;
        },
    
        // Import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Debugger.triggerMethod
    });
    
    
    
    // Widgets' mixins.
    // ----------------
    
    Widgets.Mixins = {
    
        // **Chart mixin.**
        Chart: {
            initD3Chart: function () {
                this.chart = this.svg.insert('g', '.markers').attr({class: 'area'}).selectAll('rect');
                this.chart_border = this.svg.insert('path', '.markers').attr({class: 'border'});
                this.chart_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'border pending'});
            },
            renderD3Chart: function () {
                var self = this;
    
                /* chart */
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
    
                /* border */
                var line = d3.svg.line()
                    .x(function (d) {
                        return self.timescale(self.dateFn(d.timestamp));
                    })
                    .y(function (d) {
                        if (ensure(d, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - self.y(self.valueFn(d.data)) - 1;
                        } else {
                            return self.computed('svg.height') + 2;
                        }
                    })
                    .interpolate("step-after");
                this.chart_border.datum(
                    this.buffer.all(),
                    function (d) {
                        return d.timestamp
                    })
                    .attr("d", line);
    
                /* extra border */
                var last = this.buffer.last();
                if (last) {
                    this.chart_extra.attr({
                        x1: self.timescale(self.dateFn(last.timestamp)),
                        y1: function () {
                            if (ensure(last, 'data.event.type', 'update')) {
                                return self.computed('svg.height') - self.y(self.valueFn(last.data)) - 1;
                            } else {
                                return self.computed('svg.height') + 2;
                            }
                        },
                        x2: self.timescale(self.dateFn(last.next.timestamp)),
                        y2: function () {
                            if (ensure(last, 'data.event.type', 'update')) {
                                return self.computed('svg.height') - self.y(self.valueFn(last.data)) - 1;
                            } else {
                                return self.computed('svg.height') + 2;
                            }
                        }
                    });
                }
            },
    
            updateD3ChartFocus: function(focused, unfocused) {
                var chart = this.chart.data(
                    _.compact([focused, unfocused]),
                    function (d) {
                        return d.timestamp
                    }
                );
    
                chart.attr({
                    class: function(d) {
                        return d == focused ? 'focused' : ''
                    }
                });
            },
    
            destroyD3Chart: function () {
                this.chart.remove(); delete this.chart;
                this.chart_border.remove(); delete this.chart_border;
                this.chart_extra.remove(); delete this.chart_extra;
            }
        },
    
        // **Markers mixin.**
        Markers: {
            initD3Markers: function() {
                this.markers = this.svg.append('g').attr({class: 'markers'}).selectAll('.marker');
            },
    
            renderD3Markers: function () {
                var self = this;
    
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
                        self.triggerMethod.apply(this, ['marker:click'].concat([d.data.decorations]));
                    });
                markers.attr({
                    transform: function (d) {
                        return "translate(" + self.timescale(self.dateFn(d.timestamp)) + ", 0)";
                    }
                });
                markers.exit().remove()
            },
    
            destroyD3Markers: function() {
                this.markers.remove(); delete this.markers;
            }
        },
    
        // **Aside mixin.**
        Aside: {
            updateAsidePosition: function(position) {
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
            }
        },
    
        // **Focus mixin.**
        Focus: {
            onFocusChange: function(brush) {
                this.timescale.domain(brush.empty() ? brush.x().domain() : brush.extent());
                this._render();
            }
        }
    };
    
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
    
            this.xAxisGroup = this.svg.append("g")
                .attr({'class': 'x axis ' + this.attributes.orientation})
                .call(this.xAxis);
        },
    
        onRender: function () {
            Widgets.Widget.prototype.onRender.apply(this, arguments);
    
            this.xAxisGroup.call(this.xAxis);
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
            // do nothing
        }
    });
    
    _.extend(Widgets.Timeline.prototype, Widgets.Mixins.Focus);
    
    // Widgets.Device
    // --------------
    
    Widgets.Device = Widgets.Widget.extend({
    
        onInitUI: function () {
            this._$picto = $('<div/>').addClass('picto').css({
                'height': this.computed('svg.height'),
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
        },
    
        onDestroyD3: function() {
            Widgets.Widget.prototype.onDestroyD3.apply(this, arguments);
    
            // Destroy status
            this.status.remove(); delete this.status;
    
            // Destroy markers
            this.destroyD3Markers();
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
                y1: this.computed('svg.height') - 1,
                x2: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp));
                },
                y2: this.computed('svg.height') - 1,
                class: function (d) { return d.data.event.type },
                'stroke-linecap': 'round',
                'stroke-dasharray': '1, 5'
            });
            status.attr({
                x1: function (d) {
                    return self.timescale(self.dateFn(d.timestamp))
                },
                x2: function (d) {
                    return self.timescale(self.dateFn(d.next.timestamp))
                },
                class: function (d) { return d.data.event.type },
                'stroke-linecap': 'round',
                'stroke-dasharray': '1, 5'
            });
            status.exit().remove();
    
            // Render markers
            this.renderD3Markers();
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
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
    
    _.extend(Widgets.Device.prototype, Widgets.Mixins.Markers, Widgets.Mixins.Focus);
    
    // Widgets.Temperature
    // -------------------
    
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
    
            // Setup d3 functions
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
    
    // Widgets.Switch
    // --------------
    
    
    Widgets.Switch = Widgets.Device.extend({
    
        defaults: {
            kind: 'switch',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.quantize()
                .range([0, this.computed('svg.height') - 1])
                .domain([false, true]);
    
            this.spikes = this.svg.append('g').attr({class: 'spikes'}).selectAll('line');
            this.border = this.svg.insert('path', /* insert before */ '.markers').attr({class: 'border'});
            this.border_extra = this.svg.insert('line', /* insert before */ '.markers').attr({class: 'border pending'});
        },
    
        onDestroyD3: function() {
            Widgets.Device.prototype.onDestroyD3.apply(this, arguments);
    
            delete this.y;
            this.spikes.remove(); delete this.spikes;
            this.border.remove(); delete this.border;
            this.border_extra.remove(); delete this.border_extra;
        },
    
        onRender: function () {
            Widgets.Device.prototype.onRender.apply(this, arguments);
    
            var self = this;
    
            //
            // Render spikes
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
            // Render borders
            //
            var line = d3.svg.line()
                .x(function (d) {
                    return self.timescale(self.dateFn(d.timestamp));
                })
                .y(function (d) {
                    if (ensure(d, 'data.event.type', 'update')) {
                        return self.computed('svg.height') - 1;
                    } else {
                        return self.computed('svg.height') + 2;
                    }
                })
                .interpolate("step-after");
            this.border.datum(this.buffer.all(),
                function (d) {
                    return d.timestamp
                })
                .attr('d', line);
    
            var last = this.buffer.last();
            if (last) {
                this.border_extra.attr({
                    x1: self.timescale(self.dateFn(last.timestamp)),
                    y1: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - 1;
                        } else {
                            return self.computed('svg.height') + 2;
                        }
                    },
                    x2: self.timescale(self.dateFn(last.next.timestamp)),
                    y2: function () {
                        if (ensure(last, 'data.event.type', 'update')) {
                            return self.computed('svg.height') - 1;
                        } else {
                            return self.computed('svg.height') + 2;
                        }
                    }
                });
            }
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
                this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto});
            } else {
                this._$picto.attr({class: 'picto picto-switch_type'});
            }
    
            var spikes = this.spikes.data(
                    _.compact([focusedFrame, lastFocusedFrame]),
                function (d) {
                    return d.timestamp
                }
            );
    
            spikes.classed('focused', function(d) {
                return d == focusedFrame
            });
        }
    });
    
    // Widgets.Contact
    // ---------------
    
    
    Widgets.Contact = Widgets.Device.extend({
    
        defaults: {
            kind: 'contact',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onBeforeInitD3: function () {
            Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
    
            // Setup d3 functions
            this.valueFn = function (d) {
                try {
                    if (d.timestamp) {
                        return parseBoolean(d.data.event.state.value);
                    } else {
                        return parseBoolean(d.event.state.value);
                    }
                } catch (e) {
                    return false;
                }
            };
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.ordinal()
                .range([0, this.computed('svg.height') - 1])
                .domain([false, true]);
    
            this.initD3Chart();
        },
    
        onDestroyD3: function() {
            Widgets.Device.prototype.onDestroyD3.apply(this, arguments);
    
            delete this.y;
            this.destroyD3Chart();
        },
    
        onRender: function () {
            Widgets.Device.prototype.onRender.apply(this, arguments);
    
            this.renderD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
                this._$picto.attr({class: 'picto picto-'+focusedFrame.data.event.picto});
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-contact_type'});
            }
    
            this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
        }
    });
    
    _.extend(Widgets.Contact.prototype, Widgets.Mixins.Chart);
    
    // Widgets.KeycardSwitch
    // ---------------------
    
    
    Widgets.KeycardSwitch = Widgets.Device.extend({
    
        defaults: {
            kind: 'keycardswitch',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onBeforeInitD3: function () {
            Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
    
            // Setup d3 functions
            this.valueFn = function (d) {
                try {
                    if (d.timestamp) {
                        return parseBoolean(d.data.event.state.state);
                    } else {
                        return parseBoolean(d.event.state.state);
                    }
                } catch (e) {
                    return false;
                }
            };
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.ordinal()
                .range([0, this.computed('svg.height') - 1])
                .domain([false, true]);
    
            this.initD3Chart();
        },
    
        onDestroyD3: function() {
            Widgets.Device.prototype.onDestroyD3.apply(this, arguments);
    
            delete this.y;
            this.destroyD3Chart();
        },
    
        onRender: function () {
            Widgets.Device.prototype.onRender.apply(this, arguments);
    
            this.renderD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
                this._$picto.attr({class: 'picto picto-'+focusedFrame.data.event.picto});
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-keycardswitch_type'});
            }
    
            this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
        }
    });
    
    _.extend(Widgets.KeycardSwitch.prototype, Widgets.Mixins.Chart);
    
    // Widgets.SmartPlug
    // -----------------
    
    
    Widgets.SmartPlug = Widgets.Device.extend({
    
        defaults: {
            kind: 'smartplug',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onBeforeInitD3: function () {
            Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
    
            // Setup d3 functions
            this.valueFn = function (d) {
                try {
                    if (d.timestamp) {
                        return parseBoolean(d.data.event.state.plugState);
                    } else {
                        return parseBoolean(d.event.state.plugState);
                    }
                } catch (e) {
                    return false;
                }
            };
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.ordinal()
                .range([0, this.computed('svg.height') - 1])
                .domain([false, true]);
    
            this.initD3Chart();
        },
    
        onDestroyD3: function() {
            Widgets.Device.prototype.onDestroyD3.apply(this, arguments);
    
            delete this.y;
            this.destroyD3Chart();
        },
    
        onRender: function () {
            Widgets.Device.prototype.onRender.apply(this, arguments);
    
            this.renderD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
                this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto});
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-smartplug_type'});
            }
    
            this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
        }
    });
    
    _.extend(Widgets.SmartPlug.prototype, Widgets.Mixins.Chart);
    
    // Widgets.ColorLight
    // ------------------
    
    Widgets.ColorLight = Widgets.Device.extend({
    
        defaults: {
            kind: 'colorlight',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onBeforeInitD3: function () {
            Widgets.Device.prototype.onBeforeInitD3.apply(this, arguments);
    
            // Setup d3 value function
            this.valueFn = function (d) {
                try {
                    if (d.timestamp) {
                        return parseBoolean(d.data.event.state.state);
                    } else {
                        return parseBoolean(d.event.state.state);
                    }
                } catch (e) {
                    return false;
                }
            };
    
            // Setup d3 color function
            this.colorFn = function (d) {
                try {
                    var state = d.timestamp ? d.data.event.state : d.event.state;
                    return d3.hsl(
                            Math.max(0.0, Math.min(parseInt(state.color) / 65535.0, 1.0)) * 360,
                        Math.max(0.0, Math.min(parseInt(state.saturation) / 254.0, 1.0)),
                        Math.max(0.0, Math.min(parseInt(state.brightness) / 254.0, 1.0))
                    );
                } catch (e) {
                    return d3.hsl(0, 0, 0);
                }
            }
        },
    
        onInitD3: function () {
            Widgets.Device.prototype.onInitD3.apply(this, arguments);
    
            this.y = d3.scale.ordinal()
                .range([0, this.computed('svg.height') - 1])
                .domain([false, true]);
    
            this.initD3Chart();
        },
    
        onDestroyD3: function() {
            Widgets.Device.prototype.onDestroyD3.apply(this, arguments);
    
            delete this.y;
            this.destroyD3Chart();
        },
    
        onRender: function () {
            Widgets.Device.prototype.onRender.apply(this, arguments);
    
            this.renderD3Chart();
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
            Widgets.Device.prototype.onRulerFocusUpdate.apply(this, arguments);
    
            if (ensure(focusedFrame, 'data.event.type', 'update') && ensure(focusedFrame, 'data.event.picto')) {
                this._$picto.attr({class: 'picto picto-' + focusedFrame.data.event.picto}).css({
                    'background-color': this.valueFn(focusedFrame) ? this.colorFn(focusedFrame).toString() : 'transparent'
                });
            } else {
                // fallback
                this._$picto.attr({class: 'picto picto-colorlight_type'}).css({
                    'background-color': 'transparent'
                });
            }
    
            this.updateD3ChartFocus(focusedFrame, lastFocusedFrame);
        }
    });
    
    _.extend(Widgets.ColorLight.prototype, Widgets.Mixins.Chart);
    
    
    // Widgets.Program
    // ---------------
    
    Widgets.Program = Widgets.Widget.extend({
    
        defaults: {
            kind: 'program',
            buffer: {
                pairing: true,
                shadowing: true
            }
        },
    
        onInitD3: function () {
            this.state = this.svg.append('g').attr({class: 'program state'}).selectAll('rect');
            this.initD3Markers();
        },
    
        onRender: function () {
            Widgets.Widget.prototype.onRender.apply(this, arguments);
    
            var self = this;
    
            //
            // Render State
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
                class: function (d) { return d.data.event.state.name; }
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
                class: function (d) { return d.data.event.state.name; },
                rx: 5,
                ry: 5
            });
            state.exit().remove();
    
            //
            // Render Markers
            //
            this.renderD3Markers();
        },
    
        onRulerFocusUpdate: function (position, timestamp, focusedFrame, lastFocusedFrame) {
            var state = this.state.data(
                _.compact([focusedFrame, lastFocusedFrame]),
                function (d) {
                    return d.timestamp
                }
            );
    
            state.classed('focused', function (d) {
                return d == focusedFrame
            });
        }
    });
    
    _.extend(Widgets.Program.prototype, Widgets.Mixins.Markers, Widgets.Mixins.Focus);
    
    

    return Debugger;
}));