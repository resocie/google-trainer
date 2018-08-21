const fs = require("fs");
// var util = require('util');
var dateFormat = require('dateformat');
var sprintf = require('sprintf-js').sprintf
// var csv = require("csv");

// const env = require('system').env;
// const google_email = env.MY_GOOGLE_EMAIL;
// const google_passwd = env.MY_GOOGLE_PASSWD;


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
    var filename = getFilename(qualifier+'-page', 'html');
    fs.write(filename, html, 'w'); // and save it to a file (https://docs.nodejitsu.com/articles/file-system/how-to-write-files-in-nodejs)
    casper.log("[saveHtmlPage] HTML saved at " + filename,'info');
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

var logWaitForTimeout = function(timeout, details) {
    casper.echo(sprintf('Waitfor timeout. timeout=%d details=%s', timeout, details),'error');
    casper.log(sprintf('Waitfor timeout. timeout=%d details=%s', timeout, details),'error');
    
    for(p in details) {
        casper.log(sprintf('  %s=%s',p,details[p]) , 'error')
    }

    saveHtmlPage('timeout');
    screenshot();

    casper.exit();

}

var logToFile = function(e, origin) {
    // {
    //     level:   "debug",
    //     space:   "phantom",
    //     message: "A message",
    //     date:    "a javascript Date instance"
    // }
    // var logfilename = path + 'training.'+ start_as_str + '.log';
    var logfilename = path + 'training.'+ timestamp + '.log';

    if ( typeof e === 'string' ) {
        e = {
            'date' : dateFormat(new Date(), "yyyymmddHHMM"),
            'level' : 'ERROR',
            'space' : origin,
            'message' : e
        }
    }

    var row = sprintf("%(date)s [%(level)s] %(space)s - %(message)s\n",e);
    fs.write(logfilename, row, 'a');
}

var login = function(email, pass) {
	var loginurl = 'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin&nojavascript=1#identifier'
	var qualifier = 'login'

	casper.start(loginurl, function() {
		casper.log('['+alias+'] Login page loading...','info')
		screenshot(qualifier+'.1loginpage',false)

		casper.waitForSelector('form#gaia_loginform', function() {
			casper.log('['+alias+'] Login page loaded','info')
			casper.log('['+alias+'] Filling email','info')
		});
	});

	casper.then(function() {
		this.fill('form#gaia_loginform', { 'Email':  email }, false);
		screenshot(qualifier+'.2emailfilled',false);
	});

	casper.then(function() {
		this.click('input#next');
			casper.log('['+alias+'] Password page loading','info')
			casper.waitForSelector('form#gaia_loginform #Passwd', function() { 
				this.log('['+alias+'] Password page loaded', 'debug');
				screenshot(qualifier+'.3passwordpage',false);
			});
	})

	casper.then(function() {
		this.log('['+alias+'] Filling password','info')
		this.fill('form#gaia_loginform', { 'Passwd':  pass }, false);
		screenshot(qualifier+'.4passwordfilled',false)
	})

	casper.then(function() {
		this.log('['+alias+'] Signing in...','info')
		this.click('input#signIn');
	})

	casper.then(function() {
		screenshot(qualifier+'.5loggedin',false);
	})

}

var searchFor = function(query) {

	casper.thenOpen('http://google.com/', function() {
		casper.log('Searching for "' + query + '"', 'info')
		this.waitForSelector('form[action="/search"]')
		screenshot('searchFor.'+query+'.googlehome',false)
	});

	casper.then(function() {
		this.fillSelectors('form[name="f"]', {
			'input[title="Pesquisa Google"]' : query
		}, true);
	})

	// casper.then(function() {
	// 	this.wait(20000, function() {
	// 		screenshot('searchFor.'+query+'.afterwait')
	// 	})
	// })

	casper.then(function() {
		casper.waitForText('Aproximadamente', function() {
    		casper.log('Results for "' + query +'"','info')
    		screenshot('searchFor.'+query+'.resultpage.',false)
    		saveHtmlPage('searchFor.'+query+'.resultpage.',false)
    	});
	})

}

var visit = function(url) {
	casper.log('Visiting ' + url, 'info')
	casper.thenOpen(url, function() {
		screenshot('visit.'+url.split('//')[1].replace(/\./g,'').replace(/\//g,'|'), true)
	})
	casper.log(url + ' visited.')
}

var logout = function(email) {
	logouturl = 'https://accounts.google.com/Logout';
	casper.log('Signing out','info')
	casper.thenOpen(logouturl,function() {
		this.waitForSelector('h1#headingText')
		screenshot('logout.'+alias+'.8loggedout',false)
	})

	casper.thenOpen('http://google.com/', function() {
		this.waitForSelector('form[action="/search"]')
		screenshot('logout.'+alias+'.9googlehome',false)
	});
}

//////// THE VERY BEGINNIG //////////

// start_as_ms = new Date();
// start_as_str = dateFormat(start_as_ms, "yyyymmddHHMM");


var casper = require('casper').create({
	verbose: true,
	logLevel: 'debug',
	waitTimeout: 10000,
	onWaitTimeout: logWaitForTimeout,
	viewportSize: {
        width: 1920,
        height: 1080
    }
});
casper.log('Creating casper object created', 'debug')

// casper.then(function() {
//     this.exit(2);
// });

// throw new Error('casperjs fail');

// casper.thenOpen('www.terra.com.br', function() {
// 	casper.echo('visita feita')
// })

// Events
casper.on('waitFor.timeout', logWaitForTimeout);
casper.on('log', logToFile, 'local');

// Args
casper.log('Checking arguments', 'debug')
if (! casper.cli.has(5)) {
    casper.echo('[ERROR] Argument missing. Usage:');
    casper.echo('');
    casper.echo('   $ casperjs collect.js <timestamp> <email> <password> <queries> <urls>');
    casper.echo('');
    casper.exit();
}

var timestamp = casper.cli.get(0);
var email = casper.cli.get(1);
var pass = casper.cli.get(2);
var alias = casper.cli.get(3);
var queries = casper.cli.get(4).split(',');
var urls = casper.cli.get(5).split(',');

casper.log('timestamp='+timestamp,'debug')
casper.log('email='+email,'debug')
casper.log('pass='+pass,'debug')
casper.log('alias='+alias,'debug')
casper.log('queries='+queries,'debug')
casper.log('urls='+urls,'urls')


// Working dirs
casper.log('Creating working dir', 'debug')
parent_dir = 'output'
if( !fs.exists(parent_dir) ) {
    fs.makeDirectory(parent_dir);
}

// path = parent_dir + '/' + start_as_str + '/'
path = parent_dir + '/' + timestamp + '/'
fs.makeDirectory(path);

casper.log('Logging in...', 'debug')
login(email, pass)

for(var q=0; q < queries.length; q++) {
	query = queries[q]
	casper.log('Searching for "' + query + "'", 'debug')
	searchFor(queries[q]);

}

for(var u=0; u < urls.length; u++) {
	url = urls[u]
	casper.log('Visiting '+url,'debug')
	visit(url)
}

logout(email)

casper.run();

