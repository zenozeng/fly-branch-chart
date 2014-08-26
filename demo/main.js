var ul = document.querySelector('ul');
for(var i = 0; i < 200; i++) {
    var li = document.createElement('li');
    li.innerHTML = "No. " + i;
    var branchWidth = Math.random() * 48;
    var branches = [
        {color: "rgba(0, 0, 0, .3)", width: branchWidth},
        {color: "rgba(0, 0, 255, .3)", width: Math.random() * branchWidth}
    ];
    li.dataset.flyBranch = JSON.stringify(branches);
    ul.appendChild(li);
}
var yaUl = ul.cloneNode(true);
document.body.appendChild(yaUl);

var flyBranchChart = new FlyBranchChart([
    {
        width: 200,
        height: 400,
        container: ul,
        elements: ul.querySelectorAll('li'),
        canvas: document.querySelector('#c1')
    },
    {
        width: 200,
        height: 400,
        container: yaUl,
        elements: yaUl.querySelectorAll('li'),
        canvas: document.querySelector('#c2'),
        reverse: true
    }
]);
flyBranchChart.start();
ul.addEventListener('scroll', function() {
    flyBranchChart.resume();
});
