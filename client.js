(function() {
    (console.warn ? console.warn : console.log)("%cSending logs to console-stream", "color:#888;text-decoration:underline");
    var URL = "{{ URL }}/{{ CHANNEL }}";
    function deepSanitize(value, seen) {
        if (!seen) {
            seen = [];
            if (value instanceof Object) {
                seen.push(value);
            }
        }
        if (value === undefined) {
            return { __type: "undefined" };
        }
        if (value instanceof Date) {
            return { __type: "date", value: +value };
        }
        if (value instanceof Error) {
            return { __type: "error", stack: value.stack, message: value.message };
        }
        if (value instanceof Function) {
            return { __type: "function", stringified: value.toString() };
        }
        if (value instanceof Node) {
            var outp = { __type: "node", tagName: value.nodeName.toLowerCase() };
            if (value instanceof Element) {
                outp.attrs = {};
                var attrs = value.attributes;
                for (var i = 0; i < attrs.length; ++i) {
                    outp.attrs[attrs[i].name] = attrs[i].value;
                }
            }
            return outp;
        }
        if (value instanceof Object) {
            var outp = value instanceof Array ? [] : {};
            for (let k in value) {
                if (seen.indexOf(value[k]) !== -1) {
                    outp[k] = "<circular reference>";
                } else {
                    if (value[k] instanceof Object) {
                        seen.push(value[k]);
                    }
                    outp[k] = deepSanitize(value[k], seen);
                }
            }
            return outp;
        }
        return value;
    }
    function sendMessage(method, args) {
        var req = new XMLHttpRequest();
        req.open("POST", URL + "/" + method);
        req.setRequestHeader("Content-Type", "application/json");
        var values = [];
        for (var i = 0; i < args.length; ++i) {
            values[i] = deepSanitize(args[i]);
        }
        req.send(JSON.stringify({
            time: Date.now(),
            args: values
        }));
    }
    var oldMethods = {};
    var methods = ["log", "warn", "error", "debug"];
    for (var i = 0; i < methods.length; ++i) {
        var method = methods[i];
        oldMethods[method] = console[method];
        (function(method){
            console[method] = function(){
                sendMessage(method, arguments);
                oldMethods[method].apply(this, arguments);
            };
        })(method);
    }
})();
