const fs = require("fs");
var dateFormat = require('dateformat');



var getFilename = function(prefix, extension) {
	casper.log('[getFilename] Building filename with prefix="'+prefix+'" and extension="'+extension+'"','debug')

    var now = dateFormat(new Date(), 'yyyymmddHHMMss');
    // var filename = path+'coleta.' + query + '.'+ start_as_str + '.' + prefix + '.' + now + '.' + extension
    var filename =  path + "/" + now + "." + alias + '.' + prefix + '.' + extension 

    casper.log('[getFilename] Filename = ' + filename,'debug')
    return filename;
}

var saveHtmlPage = function(qualifier) {
    casper.log("[saveHtmlPage] Saving HTML...",'debug');
    var html = String(casper.getHTML()); // grab our HTML (http://casperjs.readthedocs.org/en/latest/modules/casper.html#gethtml)
    // var filename = getFilename(target.replace(/[^A-z]/g, ''), 'html') ; // create a sanitized filename by removing all the non A-Z characters (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
    var filename = getFilename('page-'+qualifier, 'html');
    fs.write(filename, html, 'w'); // and save it to a file (https://docs.nodejitsu.com/articles/file-system/how-to-write-files-in-nodejs)
    casper.log("[saveHtmlPage] HTML saved at " + filename,'info');
}

var screenshot = function(qualifier) {
    casper.log('[screenshot] start','debug');
    casper.capture(getFilename('screenshot-'+qualifier,'png'));
    casper.log('[screenshot] end','debug');
}

var login = function(email, pass) {
	var loginurl = 'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin&nojavascript=1#identifier'
	var qualifier = 'login.'+alias

	casper.start(loginurl, function() {
		casper.log('['+alias+'] Login page loading...','info')
		screenshot(qualifier+'.1loginpage')

		casper.waitForSelector('form#gaia_loginform', function() {
			casper.log('['+alias+'] Login page loaded','info')
			casper.log('['+alias+'] Filling email','info')
		});
	});

	casper.then(function() {
		this.fill('form#gaia_loginform', { 'Email':  email }, false);
		screenshot(qualifier+'.2emailfilled');
	});

	casper.then(function() {
		this.click('input#next');
			casper.log('['+alias+'] Password page loading','info')
			casper.waitForSelector('form#gaia_loginform #Passwd', function() { 
				this.log('['+alias+'] Password page loaded', 'debug');
				screenshot(qualifier+'.3passwordpage');
			});
	})

	casper.then(function() {
		this.log('['+alias+'] Filling password','info')
		this.fill('form#gaia_loginform', { 'Passwd':  pass }, false);
		screenshot(qualifier+'.4passwordfilled')
	})

	casper.then(function() {
		this.log('['+alias+'] Signing in...','info')
		this.click('input#signIn');
	})

	casper.then(function() {
		screenshot(qualifier+'.5loggedin');
	})

}


var myactivity = function() {
	// var url = 'https://myactivity.google.com/myactivity'
	var url = 'https://myactivity.google.com/myactivity'

	casper.log('Visiting '+email+'\'s activities...')
	
	casper.thenOpen(url, function() {
		this.waitForText('Apenas você pode ver esses dados', function() {
			casper.wait(10000, function() {
				screenshot('myactivity');
				saveHtmlPage('myactivity');
			});		
		})
	});

}

var logout = function(email) {
	logouturl = 'https://accounts.google.com/Logout';
	casper.log('Signing out','info')
	casper.thenOpen(logouturl,function() {
		this.waitForSelector('h1#headingText')
		screenshot('logout.'+alias+'.8loggedout')
	})

	casper.thenOpen('http://google.com/', function() {
		this.waitForSelector('form[action="/search"]')
		screenshot('logout.'+alias+'.9googlehome')
	});
}

//////// THE VERY BEGINNIG //////////

// start_as_ms = new Date();
// start_as_str = dateFormat(start_as_ms, "yyyymmddHHMM");

var casper = require('casper').create({
	verbose: true,
	logLevel: 'debug',
	waitTimeout: 10000,
	viewportSize: {
        width: 1920,
        height: 1080
    }
});

// Events
// casper.on('waitFor.timeout', logWaitForTimeout);
// casper.on('log', logToFile, 'local');

// Args
if (! casper.cli.has(3)) {
    casper.echo('[ERROR] Argument missing. Usage:');
    casper.echo('');
    casper.echo('   $ casperjs collect.js <timestamp> <email> <password> <alias>');
    casper.echo('');
    casper.exit();
}

var timestamp = casper.cli.get(0);
var email = casper.cli.get(1);
var pass = casper.cli.get(2);
var alias = casper.cli.get(3);


casper.log('timestamp='+timestamp,'debug')
casper.log('email='+email,'debug')
casper.log('pass='+pass,'debug')
casper.log('alias='+alias,'debug')



// Working dirs
parent_dir = 'output'
if( !fs.exists(parent_dir) ) {
    fs.makeDirectory(parent_dir);
}

path = parent_dir + '/' + timestamp + '/'
fs.makeDirectory(path);


login(email, pass)
myactivity()
logout(email)

casper.run();

