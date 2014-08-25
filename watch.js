var watch = require('node-watch'),
    exec = require('child_process').exec;

watch('.',  { recursive: true, followSymLinks: true }, function(filename) {
    if(filename === "browser.js") return;
    console.log(filename, ' changed.');
    exec('./build.sh');
});
