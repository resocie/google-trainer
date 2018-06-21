const fs = require('fs');
// var util = require('util');
var dateFormat = require('dateformat');
var sprintf = require('sprintf-js').sprintf

// const env = require('system').env;
// const google_email = env.MY_GOOGLE_EMAIL;
// const google_passwd = env.MY_GOOGLE_PASSWD;


var getFilename = function(prefix, extension) {
	casper.log('[getFilename] Building filename with prefix="'+prefix+'" and extension="'+extension+'"','debug')

    var now = dateFormat(new Date(), 'yyyymmddHHMM');
    // var filename = path+'coleta.' + query + '.'+ start_as_str + '.' + prefix + '.' + now + '.' + extension
    var filename = path + "/" + prefix + ".google-search." + now + "." + extension 

    casper.log('[getFilename] Filename = ' + filename,'debug')
    return filename;
}

var saveHtmlPage = function(qualifier) {
    // casper.then(function() { // Otherwise
        casper.log("[saveHtmlPage] Saving HTML...",'debug');
        var html = String(casper.getHTML()); // grab our HTML (http://casperjs.readthedocs.org/en/latest/modules/casper.html#gethtml)
        // var filename = getFilename(target.replace(/[^A-z]/g, ''), 'html') ; // create a sanitized filename by removing all the non A-Z characters (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
        var filename = getFilename('page-'+qualifier, 'html');
        fs.write(filename, html, 'w'); // and save it to a file (https://docs.nodejitsu.com/articles/file-system/how-to-write-files-in-nodejs)
        casper.log("[saveHtmlPage] HTML saved at " + filename,'info');
    // });
}

var screenshot = function(qualifier) {
    casper.log('[screenshot] start','debug');
    casper.capture(getFilename('screenshot-'+qualifier,'png'));
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

var login = function(email, pass) {
	var loginurl = 'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin&nojavascript=1#identifier'

	casper.start(loginurl, function() {
		casper.log('Login page loading...','info')
		screenshot('loginpage')

		casper.waitForSelector('form#gaia_loginform', function() {
			casper.log('Login page loaded','info')
			casper.log('Filling email','info')
			this.fill('form#gaia_loginform', {
				'Email':  email
			}, false);
			screenshot('emailfilled')
			
			this.click('input#next');
			casper.log('Password page loading','info')
		
			casper.waitForSelector('form#gaia_loginform #Passwd', function() { 
				screenshot('passwordpage')
				casper.log('Filling password','info')

				this.fill('form#gaia_loginform', {
					'Passwd':  pass
				}, false);
				screenshot('passwordfilled')

				casper.log('Signing in...','info')
				this.click('input#signIn');
			});
		});
	});
}

var searchFor = function(query) {

	casper.thenOpen('http://google.com', function() {
		
		casper.log('Loading Google Search...', 'info');
	    casper.waitForSelector('form[action="/search"]', function() {
	    	screenshot('googlehome');
	    	casper.log('Google page loaded','info');

	    	this.fillSelectors('form[name="f"]', {
	    		'input[title="Pesquisa Google"]' : query
	    	}, true);


	    	casper.log('Searching...','info')
	    	// casper.waitForSelector('div#foot', function() {
	    	casper.waitForText('Pesquisas relacionadas', function() {
	    		casper.log('Results page loaded','info')
	    		screenshot('resultpage')
	    	});
	    });
	});

}
//////// THE VERY BEGINNIG //////////

start_as_ms = new Date();
start_as_str = dateFormat(start_as_ms, "yyyymmddHHMM");

var casper = require('casper').create({
	verbose: true,
	logLevel: 'debug',
	waitTimeout: 10000,
	viewportSize: {
        width: 1920,
        height: 1080
    }
});

casper.on('waitFor.timeout', logWaitForTimeout);

parent_dir = 'data'
if( !fs.exists(parent_dir) ) {
    fs.makeDirectory(parent_dir);
}

path = parent_dir + '/' + start_as_str + '/'
fs.makeDirectory(path);

login('alegomes@gmail.com','!2#Pipoc@')
// const env = require('system').env;
// const google_email = env.MY_GOOGLE_EMAIL;
// const google_passwd = env.MY_GOOGLE_PASSWD;

searchFor('arroz')


casper.run();

