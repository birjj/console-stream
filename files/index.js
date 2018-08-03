'use strict';

/**
 * Our connection to the server.
 */
var WSClient = /** @class */ (function () {
    function WSClient(channel) {
        var _this = this;
        this._listeners = {};
        this._handleMessage = function (e) {
            var msg = JSON.parse(e.data);
            var unserialized = _this._unserializeMessage(msg);
            _this.emit(msg.type, unserialized);
            _this.emit("*", unserialized);
        };
        this.channel = channel;
        var HOST = location.origin.replace(/^http/, "ws");
        this.ws = new WebSocket(HOST);
        this.ws.addEventListener("open", function () {
            _this.ws.send(JSON.stringify({ channel: channel, }));
        });
        this.ws.addEventListener("message", this._handleMessage);
    }
    /** Shuts down the connection */
    WSClient.prototype.close = function () {
        this.ws.close();
    };
    WSClient.prototype._unserializeValue = function (value) {
        if (!(value instanceof Object)) {
            return value;
        }
        if (value.__type) {
            switch (value.__type) {
                case "undefined":
                    return undefined;
                case "date":
                    return new Date(value.value);
                case "error":
                    var err = new Error();
                    err.message = value.message;
                    err.stack = value.stack;
                    return err;
            }
        }
        return value;
    };
    WSClient.prototype._unserializeMessage = function (msg) {
        var _this = this;
        if (msg.value && msg.value instanceof Array) {
            msg.value = msg.value.map(function (v) { return _this._unserializeValue(v); });
        }
        return msg;
    };
    /* EventEmitter implementation */
    WSClient.prototype.on = function (event, cb) {
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(cb);
    };
    WSClient.prototype.emit = function (event) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (!this._listeners[event]) {
            return;
        }
        this._listeners[event].forEach(function (cb) { return cb.apply(void 0, data); });
    };
    return WSClient;
}());

/**
 * An element that automatically selects everything inside of it when clicked.
 */
var Selectable = /** @class */ (function () {
    function Selectable($node) {
        var _this = this;
        /** Whether we selected the element in this interaction round */
        this.hasSelected = false;
        /** If we are in the middle of a click, where the click happened */
        this.clickPos = null;
        this.select = function () {
            if (!_this.shouldSelect()) {
                return;
            }
            _this.hasSelected = true;
            if (window.getSelection) {
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(_this.$node);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };
        this.onMouseDown = function (e) {
            if (!(e.buttons & 1)) {
                return;
            }
            _this.clickPos = [e.offsetX, e.offsetY];
        };
        this.onMouseUp = function (e) {
            if (_this.clickPos) {
                var dx = e.offsetX - _this.clickPos[0];
                var dy = e.offsetY - _this.clickPos[1];
                var dist = Math.sqrt(dx * dx + dy * dy);
                _this.clickPos = null;
                if (dist < 10) {
                    _this.select();
                }
                _this.hasSelected = true;
            }
        };
        if (!$node) {
            throw new Error("Cannot create Selectable for " + $node);
        }
        this.$node = $node;
        $node.addEventListener("focus", this.select);
        $node.addEventListener("mousedown", this.onMouseDown);
        $node.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("click", function (e) {
            if (!$node.contains(e.target)) {
                _this.hasSelected = false;
            }
        });
    }
    Selectable.prototype.shouldSelect = function () {
        return !this.hasSelected && !this.clickPos;
    };
    return Selectable;
}());

/**
 * An element that contains tabbed content.
 */
var Tabbed = /** @class */ (function () {
    function Tabbed($node) {
        var _this = this;
        this.$node = $node;
        this.tabs = Array.from($node.querySelectorAll(".tab")).map(function ($tab) {
            $tab.addEventListener("click", function () {
                _this.handleTabChange($tab);
            });
            return {
                $elm: $tab,
                $target: $node.querySelector($tab.getAttribute("data-target")),
            };
        });
    }
    Tabbed.prototype.handleTabChange = function ($elm) {
        this.tabs.forEach(function (tab) {
            var isActive = tab.$elm === $elm;
            if (tab.$target) {
                tab.$target.classList.toggle("active", isActive);
            }
            if (tab.$elm) {
                tab.$elm.classList.toggle("active", isActive);
            }
        });
    };
    return Tabbed;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var BaseValue = /** @class */ (function () {
    function BaseValue(val) {
        this.value = val;
    }
    /** Renders an element with proper classes, but no content */
    BaseValue.prototype.renderWrapper = function () {
        var $elm = document.createElement("span");
        $elm.classList.add("type");
        $elm.classList.add("type--" + this.className);
        return $elm;
    };
    /** Renders the Value in a way that's suitable for display inside other components (e.g. no expandable) */
    BaseValue.prototype.renderTitle = function () {
        var $elm = BaseValue.prototype.render.call(this, 0, [this.value]);
        return $elm;
    };
    /**
     * Renders the Value in the usual way (e.g. with expandable)
     * @param {number} index The index of the value in the args
     * @param {any[]} args The args this is logged with - used for e.g. string formatting
     * @param {boolean} isRoot Whether we are rendering at the root level
     **/
    BaseValue.prototype.render = function (index, args, isRoot) {
        if (isRoot === void 0) { isRoot = false; }
        var $elm = this.renderWrapper();
        $elm.innerHTML = BaseValue.htmlEscape(this.stringify(this.value));
        return $elm;
    };
    BaseValue.htmlEscape = function (val) { return val.replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    return BaseValue;
}());

var BooleanValue = /** @class */ (function (_super) {
    __extends(BooleanValue, _super);
    function BooleanValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "boolean";
        return _this;
    }
    BooleanValue.prototype.stringify = function (val) {
        return "" + val;
    };
    return BooleanValue;
}(BaseValue));

var NumberValue = /** @class */ (function (_super) {
    __extends(NumberValue, _super);
    function NumberValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "number";
        return _this;
    }
    NumberValue.prototype.stringify = function (val) {
        return "" + val;
    };
    return NumberValue;
}(BaseValue));

var formatters = {
    f: function floatFormatter(val) {
        var $outp = document.createElement("span");
        if (typeof val !== "number") {
            $outp.textContent = "NaN";
            return $outp;
        }
        $outp.textContent = "" + val;
        return $outp;
    },
    i: function integerFormatter(val) {
        var $outp = document.createElement("span");
        if (typeof val !== "number") {
            $outp.textContent = "NaN";
            return $outp;
        }
        $outp.textContent = "" + Math.floor(val);
        return $outp;
    },
    d: function integerFormatter(val) {
        return formatters.i(val);
    },
    c: function styleFormatter(val) {
        return formatters.i(val);
    },
};
var StringValue = /** @class */ (function (_super) {
    __extends(StringValue, _super);
    function StringValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "string";
        return _this;
    }
    StringValue.prototype.stringify = function (val) {
        return "" + val;
    };
    StringValue.prototype.render = function (index, args, isRoot) {
        var _this = this;
        if (isRoot === void 0) { isRoot = false; }
        var $elm = this.renderWrapper();
        this.value.split(/(?=%[c])|(?<=%[c])/)
            .map(function (val) {
            if (/^%[c]$/.test(val)) {
                return formatters[val[1]](_this.value);
            }
            return document.createTextNode(val);
        })
            .forEach(function ($val) { return $elm.appendChild($val); });
        return $elm;
    };
    return StringValue;
}(BaseValue));

var UndefinedValue = /** @class */ (function (_super) {
    __extends(UndefinedValue, _super);
    function UndefinedValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "undefined";
        return _this;
    }
    UndefinedValue.prototype.stringify = function (val) {
        return "" + val;
    };
    return UndefinedValue;
}(BaseValue));

var DateValue = /** @class */ (function (_super) {
    __extends(DateValue, _super);
    function DateValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "date";
        return _this;
    }
    DateValue.prototype.stringify = function (val) {
        return val.toString();
    };
    return DateValue;
}(BaseValue));

var ErrorValue = /** @class */ (function (_super) {
    __extends(ErrorValue, _super);
    function ErrorValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "error";
        return _this;
    }
    ErrorValue.prototype.stringify = function (val) {
        return val.stack || val.message;
    };
    return ErrorValue;
}(BaseValue));

var FunctionValue = /** @class */ (function (_super) {
    __extends(FunctionValue, _super);
    function FunctionValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "function";
        return _this;
    }
    FunctionValue.prototype.stringify = function (val) {
        return val.stringified.replace(/^function/, "");
    };
    FunctionValue.prototype.render = function (index, args, isRoot) {
        if (isRoot === void 0) { isRoot = false; }
        var $elm = _super.prototype.render.call(this, index, args);
        $elm.setAttribute("title", this.value.stringified);
        var $f = document.createElement("span");
        $f.classList.add("type--function__f");
        if (/^function/.test(this.value.stringified)) {
            $f.textContent = "ƒ";
            $elm.insertBefore($f, $elm.firstChild);
        }
        return $elm;
    };
    return FunctionValue;
}(BaseValue));

var Expandable = /** @class */ (function () {
    function Expandable($title, $content) {
        this.$elm = null;
        this.expanded = false;
        this.$title = $title;
        this.$content = $content;
    }
    Expandable.prototype.render = function () {
        var _this = this;
        if (this.$elm) {
            return this.$elm;
        }
        var $elm = document.createElement("span");
        $elm.classList.add("expandable");
        // create arrow
        var $arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        $arrow.classList.add("arrow");
        var $symbol = document.createElementNS("http://www.w3.org/2000/svg", "use");
        $symbol.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#i-arrow");
        $arrow.appendChild($symbol);
        // create title
        var $title = document.createElement("span");
        $title.classList.add("expandable__title");
        $title.appendChild($arrow);
        $title.appendChild(this.$title);
        $elm.appendChild($title);
        $title.addEventListener("click", function () {
            _this.expanded = !_this.expanded;
            $elm.classList.toggle("expandable--expanded", _this.expanded);
        });
        // create content
        var $content = document.createElement("div");
        $content.classList.add("expandable__content");
        $content.appendChild(this.$content);
        $elm.appendChild($content);
        return this.$elm = $elm;
    };
    return Expandable;
}());

var ArrayValue = /** @class */ (function (_super) {
    __extends(ArrayValue, _super);
    function ArrayValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "array";
        return _this;
    }
    ArrayValue.prototype.stringify = function (val) {
        return "Array(" + val.length + ")";
    };
    ArrayValue.prototype.renderExpandableTitle = function () {
        var $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode("(" + this.value.length + ") ["));
        this.value.forEach(function (val, i) {
            var _val = valueMapper(val);
            if (_val) {
                $elm.appendChild(_val.renderTitle());
                $elm.appendChild(document.createTextNode(", "));
            }
        });
        // we have an extra ", " appended
        $elm.removeChild($elm.lastChild);
        $elm.appendChild(document.createTextNode("]"));
        return $elm;
    };
    ArrayValue.prototype.renderExpandableContentRow = function (key, value) {
        var $row = document.createElement("div");
        $row.classList.add("key-value");
        // add key
        var $key = document.createElement("span");
        $key.classList.add("key");
        $key.textContent = key + ":";
        $row.appendChild($key);
        // add value
        var _val = valueMapper(value);
        if (_val) {
            $row.appendChild(_val.render(0, [_val.value]));
        }
        return $row;
    };
    ArrayValue.prototype.renderExpandableContent = function () {
        var $outp = document.createElement("div");
        for (var i = 0; i < this.value.length; ++i) {
            $outp.appendChild(this.renderExpandableContentRow("" + i, this.value[i]));
        }
        // add `length`
        var $lengthRow = this.renderExpandableContentRow("length", this.value.length);
        $lengthRow.classList.add("dim");
        $outp.appendChild($lengthRow);
        return $outp;
    };
    ArrayValue.prototype.render = function (index, args, isRoot) {
        if (isRoot === void 0) { isRoot = false; }
        var $elm = (new Expandable(this.renderExpandableTitle(), this.renderExpandableContent())).render();
        $elm.classList.add("expandable--array");
        return $elm;
    };
    return ArrayValue;
}(BaseValue));

var ObjectValue = /** @class */ (function (_super) {
    __extends(ObjectValue, _super);
    function ObjectValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "object";
        return _this;
    }
    ObjectValue.prototype.stringify = function (val) {
        return "Object";
    };
    ObjectValue.prototype.renderTitle = function () {
        var $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode("{" + (Object.keys(this.value).length
            ? "…"
            : "") + "}"));
        return $elm;
    };
    ObjectValue.prototype.renderExpandableTitle = function (isRoot) {
        var _this = this;
        var $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode("{"));
        // add at most 5 key-value pairs to the title
        var validKeys = 0;
        Object.keys(this.value)
            .forEach(function (k) {
            var val = _this.value[k];
            var _val = valueMapper(val);
            if (_val) {
                ++validKeys;
                if (validKeys <= 5) {
                    var $key = document.createElement("span");
                    $key.classList.add("key");
                    $key.textContent = k + ":";
                    $elm.appendChild($key);
                    $elm.appendChild(_val.renderTitle());
                    $elm.appendChild(document.createTextNode(", "));
                }
            }
        });
        // but show "..." if we have more that we don't show
        if (validKeys > 5) {
            $elm.appendChild(document.createTextNode("…"));
        }
        else if (validKeys) {
            // we have an extra ", " appended
            $elm.removeChild($elm.lastChild);
        }
        $elm.appendChild(document.createTextNode("}"));
        return $elm;
    };
    ObjectValue.prototype.renderExpandableContentRow = function (key, value) {
        var $row = document.createElement("div");
        $row.classList.add("key-value");
        // add key
        var $key = document.createElement("span");
        $key.classList.add("key");
        $key.textContent = key + ":";
        $row.appendChild($key);
        // add value
        var _val = valueMapper(value);
        if (_val) {
            $row.appendChild(_val.render(0, [_val.value]));
        }
        return $row;
    };
    ObjectValue.prototype.renderExpandableContent = function () {
        var _this = this;
        var $outp = document.createElement("div");
        Object.keys(this.value)
            .forEach(function (k) {
            var $val = _this.renderExpandableContentRow(k, _this.value[k]);
            $outp.appendChild($val);
        });
        return $outp;
    };
    ObjectValue.prototype.render = function (index, args, isRoot) {
        if (isRoot === void 0) { isRoot = false; }
        var $elm = (new Expandable(this.renderExpandableTitle(isRoot), this.renderExpandableContent())).render();
        $elm.classList.add("expandable--object");
        return $elm;
    };
    return ObjectValue;
}(BaseValue));

var NodeValue = /** @class */ (function (_super) {
    __extends(NodeValue, _super);
    function NodeValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = "node";
        return _this;
    }
    NodeValue.prototype.stringify = function (val) {
        return val.tagName;
    };
    NodeValue.prototype.renderAttrs = function (args) {
        return Object.keys(args)
            .map(function (key) {
            var $outp = document.createElement("span");
            $outp.classList.add("attr");
            var $key = document.createElement("span");
            $key.classList.add("attr__key");
            $key.textContent = key;
            $outp.appendChild($key);
            if (args[key]) {
                $outp.appendChild(document.createTextNode("=\""));
                var $val = document.createElement("span");
                $val.classList.add("attr__val");
                $val.textContent = args[key];
                $outp.appendChild($val);
                $outp.appendChild(document.createTextNode("\""));
            }
            return $outp;
        });
    };
    NodeValue.prototype.render = function (index, args, isRoot) {
        if (isRoot === void 0) { isRoot = false; }
        var $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode("<"));
        var $tagStart = document.createElement("span");
        $tagStart.classList.add("type--node__start");
        $tagStart.textContent = this.value.tagName;
        $elm.appendChild($tagStart);
        var $args = this.renderAttrs(this.value.attrs);
        if ($args.length) {
            $args.forEach(function ($node) {
                $elm.appendChild(document.createTextNode(" "));
                $elm.appendChild($node);
            });
        }
        $elm.appendChild(document.createTextNode(">…<"));
        var $tagEnd = document.createElement("span");
        $tagEnd.classList.add("type--node__end");
        $tagEnd.textContent = "/" + this.value.tagName;
        $elm.appendChild($tagEnd);
        $elm.appendChild(document.createTextNode(">"));
        return $elm;
    };
    return NodeValue;
}(BaseValue));

/**
 * Returns the Value representation of a value.
 */
function valueMapper(value) {
    if (typeof value === "number") {
        return new NumberValue(value);
    }
    if (typeof value === "boolean") {
        return new BooleanValue(value);
    }
    if (typeof value === "undefined" || value === null) {
        return new UndefinedValue(value);
    }
    if (typeof value === "string") {
        return new StringValue(value);
    }
    if (value instanceof Error) {
        return new ErrorValue(value);
    }
    if (value instanceof Date) {
        return new DateValue(value);
    }
    if (value instanceof Array) {
        return new ArrayValue(value);
    }
    if (value && value.__type === "function") {
        return new FunctionValue(value);
    }
    if (value instanceof Object) {
        if (value.__type === "node") {
            return new NodeValue(value);
        }
        return new ObjectValue(value);
    }
    return null;
}

var Message = /** @class */ (function () {
    function Message(message) {
        /** The element that represents us */
        this.$elm = null;
        this.message = message;
        this.time = new Date(this.message.time);
    }
    /**
     * Turns a string into a value that can be inserted using .innerHTML
     */
    Message.prototype.htmlifyString = function (str) {
        return str.replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    };
    /**
     * Gets the element representation of a value
     */
    Message.prototype.getElementForValue = function (value, index, args) {
        var valInstance = valueMapper(value);
        if (valInstance) {
            return valInstance.render(index, args, true);
        }
        var $outp = document.createElement("span");
        $outp.textContent = "<unknown>";
        return $outp;
    };
    /**
     * Gets the element representation of a time
     */
    Message.prototype.getElementForTime = function (time) {
        var $time = document.createElement("time");
        $time.dateTime = this.time.toISOString();
        $time.textContent =
            [this.time.getHours(), this.time.getMinutes(), this.time.getSeconds()]
                .map(function (num) { return num.toString().padStart(2, "0"); })
                .join(":")
                + ("." + this.time.getMilliseconds().toString().padEnd(3, "0"));
        $time.title = $time.dateTime.replace("T", " ").replace("Z", "");
        return $time;
    };
    /**
     * Gets the element that represents the message
     */
    Message.prototype.render = function () {
        var _this = this;
        if (this.$elm) {
            return this.$elm;
        }
        var $elm = document.createElement("div");
        $elm.classList.add("message");
        $elm.classList.add("message--" + this.message.type);
        $elm.appendChild(this.getElementForTime(this.time));
        var $content = document.createElement("div");
        $content.classList.add("content");
        this.message.value
            .map(function (v, i) { return _this.getElementForValue(v, i, _this.message.value); })
            .map(function ($node) { $node.classList.add("value"); return $node; })
            .forEach(function ($node) { return $content.appendChild($node); });
        $elm.appendChild($content);
        return this.$elm = $elm;
    };
    return Message;
}());
var Console = /** @class */ (function () {
    function Console($console, ws) {
        var _this = this;
        /** The messages we are displaying */
        this.messages = [];
        /** Filter we are filtering messages by */
        this.filter = "";
        this.onMessage = function (message) {
            if (!message.type || !message.value || !(message.value instanceof Array)) {
                return;
            }
            console.log("Received message", message);
            var msg = new Message(message);
            _this.messages.push(msg);
            _this.$messages.appendChild(msg.render());
        };
        this.onClear = function () {
            _this.messages = [];
        };
        this.onFilter = function (e) {
            var filter = e.target.value;
            console.log("Filter:", filter);
        };
        this.$console = $console;
        this.$messages = $console.getElementsByClassName("messages")[0];
        Array.from($console.getElementsByClassName("clear")).forEach(function ($clear) { return $clear.addEventListener("click", _this.onClear); });
        Array.from($console.getElementsByClassName("filter")).forEach(function ($filter) { return $filter.addEventListener("input", _this.onFilter); });
        ws.on("*", this.onMessage);
    }
    Console.prototype.destroy = function () {
        while (this.$messages.lastChild) {
            this.$messages.removeChild(this.$messages.lastChild);
        }
    };
    return Console;
}());

var alph = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function randomString(length) {
    if (length === void 0) { length = 8; }
    var outp = "";
    while (outp.length < length) {
        outp += alph[Math.floor(Math.random() * alph.length)];
    }
    return outp;
}

var MIN_CHANNEL_LEN = 1;
// basic page UI
Array.from(document.getElementsByClassName("code")).forEach(function ($node) {
    new Selectable($node);
});
Array.from(document.getElementsByClassName("tabbed")).forEach(function ($node) {
    new Tabbed($node);
});
var curChannel = location.hash.length > MIN_CHANNEL_LEN + 1 ? location.hash.substr(1) : randomString(8);
var $channelInp = document.querySelector(".channel-inp");
$channelInp.value = curChannel;
$channelInp.addEventListener("blur", function () {
    if ($channelInp.value.length > MIN_CHANNEL_LEN && $channelInp.value !== curChannel) {
        client.close();
        curChannel = $channelInp.value;
        attachClient($channelInp.value);
    }
});
// start the WS client
var client;
var console$1;
function attachClient(channel) {
    client = new WSClient(channel);
    client.on("connect", function () {
        Array.from(document.getElementsByClassName("channel")).forEach(function ($node) {
            $node.textContent = channel;
        });
        history.replaceState("", "", "#" + channel);
        document.querySelector(".prompt-content").textContent = "Awaiting logs...";
    });
    if (console$1) {
        console$1.destroy();
    }
    console$1 = new Console(document.querySelector(".console"), client);
}
attachClient(curChannel);
