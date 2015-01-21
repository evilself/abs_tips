var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'NODE ABS TIPS',
  description: 'Node Web Server',
  script: 'C:\\dev\\Node\\abs_tips\\server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    console.log('installed')
  svc.start();
});

svc.install();