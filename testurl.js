var fs = require('fs');
var dateFormat = require('dateformat');

var getFilename = function(prefix, extension) {
	casper.log('[getFilename] Building filename with prefix="'+prefix+'" and extension="'+extension+'"','debug')

    var now = dateFormat(new Date(), 'yyyymmddHHMMss');
    var filename =  path + "/" + now + "." + alias + '.' + prefix + '.' + extension 

    casper.log('[getFilename] Filename = ' + filename,'debug')
    return filename;
}

var screenshot = function(qualifier, visible) {
    casper.log('[screenshot] start','debug');
    if(visible) {
    	casper.capture(getFilename(qualifier+'-screenshot','png'), {
    		top: 0,
	        left: 0,
	        width: 1920,
	        height: 1080
    	});
    } else {
    	casper.capture(getFilename(qualifier+'-screenshot','png'));
    }
    casper.log('[screenshot] end','debug');
}

var visit = function(url) {
	casper.echo('\tVisiting ' + url)
	casper.thenOpen(url, function() {
		screenshot_filename = 'visit.'+url.split('//')[1].replace(/\./g,'').replace(/\//g,'|')
		screenshot(screenshot_filename,true)//.replace(/\./g,'').replace(/\//g,'|'), true)
	})
	casper.echo("\t"+url + ' visited.')
}

//// BEGIN ////

var casper = require('casper').create({
    verbose: true,
	logLevel: 'debug',
	waitTimeout: 10000,
	// onWaitTimeout: logWaitForTimeout,
    pageSettings: {
        loadImages:  false,
        loadPlugins: false 
    },
	viewportSize: {
        width: 1920,
        height: 1080
    }
    // logLevel: 'error',
    // pageSettings: {
    //     loadImages: false,
    //     loadPlugins: false,
    //     userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
    // }
});

var url = casper.cli.get(0);
var alias = 'varejo'

// Working dirs
casper.log('Creating working dir', 'debug')
parent_dir = 'test'
if( !fs.exists(parent_dir) ) {
    fs.makeDirectory(parent_dir);
}
path = parent_dir
fs.makeDirectory(path);

casper.start();

casper.then(function readFile() {
	visit(url)
});

casper.run();