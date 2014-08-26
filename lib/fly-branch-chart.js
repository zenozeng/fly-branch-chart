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

        var visibleElements = elements.filter(function(elem) {
            if(elem.offsetHeight === 0) return false;
            var top = elem.offsetHeight - elem.parentElement.offsetTop - scrollTop;
            return top > 0 && top < containerHeight;
        });

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
                var top = elem.offsetHeight - elem.parentElement.offsetTop - scrollTop;
                // L1 L2
                // L3 L4
                var L1 = {
                    x: reverse ? 0 : canvas.width,
                    y: (top + (elem.offsetHeight - maxWidth) / 2) * devicePixelRatio
                };
                var L3 = {x: L1.x, y: L1.y + w * devicePixelRatio};
                var L2 = {
                    x: reverse ? canvas.width : 0,
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
    });
};

var opts = {
    width: 165,
    height: 360,
    container: document.querySelector('ul'),
    items: document.querySelectorAll('li')
};
var opts2 = {
    width: 165,
    height: 360,
    container: document.querySelector('ul'),
    items: document.querySelectorAll('li'),
    reverse: true
};
var options = [opts, opts2];

module.exports = FlyBranchChart;
