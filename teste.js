const fs = require('fs');
const CDP = require('chrome-remote-interface');
var call = null;
var Page;

function navegar(url) {
    Page.navigate({url: url});
    
    return new Promise(function(resolve, reject){
        Page.loadEventFired(() => {
            return resolve();
        });
    });
    
}

CDP((client) => {
    // extract domains
    Page = client.Page;
    
    const {Network, Runtime} = client;
    // setup handlers
    Network.requestWillBeSent((params) => {
        //console.log(params.request.url);
    });
    
    
    // enable events then start!
    var all = Promise.all([
        Network.enable(),
        Page.enable()
    ]);
    
    all.then(() => {
        
        navegar('https://oneweb.com.br').then(function (){
            console.log(1);
            return Page.captureScreenshot('png', 100);
        }).then(function (image){  
            console.log(2);
            return new Promise(function (resolve, reject){
                var buf = Buffer.from(image.data, 'base64');
                fs.writeFile("tmp/img.png", buf, function(err) {
                    if(err) {
                        return reject(err);
                    }
                    return resolve();
                });
            });
        }).then(function (){
            console.log(3);
            return Runtime.evaluate({expression: 'document.documentElement.innerHTML'});
        }).then(function (){
            console.log(4);
            Runtime.evaluate({expression: 'document.querySelector(\'a[href="/empresa"]\').click()'});
            return new Promise(function(resolve, reject){
                Page.loadEventFired(() => {
                    return resolve();
                });
            });
            
        }).then(function (){
            console.log(5);
            return new Promise(function (resolve, reject){
                setTimeout(function (){
                    console.log(6);
                    return resolve(Page.captureScreenshot('png', 100));
                },5000);
            });
            
        }).then(function (image){
            console.log(7);
            var buf = Buffer.from(image.data, 'base64');
                
            return new Promise(function (resolve, reject){
                console.log(8);
                fs.writeFile("tmp/img2.png", buf, function(err) {
                    if(err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }).then(function (){
            console.log(9);
            client.close();
        });

        
    }).catch((err) => {
        console.error(err);
        client.close();
    });
}).on('error', (err) => {
    // cannot connect to the remote endpoint
    console.error(err);
});
