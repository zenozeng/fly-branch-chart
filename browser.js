!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FlyBranchChart=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Interval = require('node-interval');

var generateDrawFn = function(options) {
    var devicePixelRatio = window.devicePixelRatio,
        canvas = options.canvas,
        width = options.width,
        height = options.height,
        ctx = canvas.getContext('2d'),
        container = options.container,
        elements = options.elements,
        reverse = options.reverse;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    return function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var scrollTop = container.scrollTop,
            containerHeight = container.offsetHeight;

        var visibleElements = [];
        for(var i = 0; i < elements.length; i++) {
            var elem = elements[i];
            if(elem.offsetHeight === 0) continue;
            var top = elem.offsetTop - container.firstElementChild.offsetTop - scrollTop;
            if( top >= 0 && top < containerHeight) {
                visibleElements.push(elem);
            }
        }

        visibleElements.forEach(function(elem) {
            // [{width: 48, color: "rgba(0, 0, 0, .5)"}, {}]
            try {
                var branches = JSON.parse(elem.dataset.flyBranch);
            } catch(e) {
                return;
            }
            var maxWidth = Math.max.apply(this, branches.map(function(branch) {
                return branch.width;
            }));
            branches.forEach(function(branch) {
                var w = branch.width;
                var top = elem.offsetTop - container.firstElementChild.offsetTop - scrollTop;
                // L1 L2
                // L3 L4
                var L1 = {
                    x: reverse ? canvas.width : 0,
                    y: (top + (elem.offsetHeight - maxWidth) / 2) * devicePixelRatio
                };
                var L3 = {x: L1.x, y: L1.y + w * devicePixelRatio};
                var L2 = {
                    x: reverse ? 0 : canvas.width,
                    y: (canvas.height - w) / 2
                };
                var L4 = {
                    x: L2.x,
                    y: (canvas.height + w) / 2
                };
                var control = {x: canvas.width / 2, y: canvas.height / 2};

                ctx.beginPath();
                ctx.moveTo(L1.x, L1.y);
                ctx.quadraticCurveTo(control.x, control.y, L2.x, L2.y);
                ctx.lineTo(L4.x, L4.y);
                ctx.quadraticCurveTo(control.x, control.y, L3.x, L3.y);
                ctx.lineTo(L1.x, L1.y);

                ctx.fillStyle = branch.color;
                ctx.fill();
            });
        });
    };
};

var FlyBranchChart = function(options) {
    if(!Array.isArray(options)) {
        options = [options];
    }
    var fns = options.map(function(opts) {
        return generateDrawFn(opts);
    });
    return new Interval(function() {
        fns.forEach(function(fn) {
            fn();
        });
    }, 16, 1000);
};

module.exports = FlyBranchChart;

},{"node-interval":2}],2:[function(require,module,exports){
/**
 * Interval.js
 *
 * @constructor
 * @param {function} func - The function you want to be called repeatly
 * @param {int} delay - milliseconds that should wait before each call
 * @param {int} lifetime - if set, clearInterval will be called after `lifetime` milliseconds
 */
function Interval(func, delay, lifetime) {
    this.func = func;
    this.delay = delay;
    this.lifetime = lifetime;
    this.interval = null;
    this.gcTimeout = null;
}

var interval = Interval.prototype;

/**
 * clearInterval without touching lifetime
 *
 * @method Interval#pause
 */
Interval.prototype.pause = function() {
    if(this.interval) {
        clearInterval(this.interval);
        this.interval = null;
    }
}

/**
 * setInterval if not set
 *
 * @method Interval#resume
 */
interval.resume = function() {
    if(this.interval === null) {
        this.start();
    }
}

/**
 * setInterval & setTimeout for clearInterval if lifetime set
 *
 * @method Interval#start
 * @param {int} delay - milliseconds that should wait before each call, defaults to this.delay
 * @param {int} lifetime - if set, clearInterval will be called after `lifetime` milliseconds, defaults to this.lifetime
 */
interval.start = function(delay, lifetime) {
    this.stop();
    delay = delay || this.delay;
    lifetime = lifetime || this.lifetime;
    this.interval = setInterval(this.func, this.delay);
    if(lifetime) {
        var that = this;
        this.gcTimeout = setTimeout(function() {
            that.gcTimeout = null;
            that.stop();
        }, lifetime);
    }
}

/**
 * clearInterval and clearTimeout for lifetime
 *
 * @method Interval#stop
 */
interval.stop = function() {
    if(this.interval) {
        clearInterval(this.interval);
        this.interval = null;
    }
    if(this.gcTimeout) {
        clearTimeout(this.gcTimeout);
        this.gcTimeout = null;
    }
}

/**
 * Run func once
 *
 * @method Interval#once
 */
interval.once = function() {
    this.func();
}

interval.restart = interval.start;

module.exports = Interval;

},{}]},{},[1])(1)
});