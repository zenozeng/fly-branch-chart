var Interval = require('interval-js');

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
        var getTop = function(elem) {
            return elem.offsetTop - container.offsetTop - scrollTop;
        };
        for(var i = 0; i < elements.length; i++) {
            var elem = elements[i];
            if(elem.offsetHeight === 0) continue;
            var top = getTop(elem);
            if( top >= -elem.offsetHeight && top < containerHeight) {
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
                var top = getTop(elem);

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
    }, {lifetime: 5000, useRequestAnimationFrame: true});
};

module.exports = FlyBranchChart;
