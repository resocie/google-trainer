const fs = require('fs');
// var util = require('util');
var dateFormat = require('dateformat');
var sprintf = require('sprintf-js').sprintf

var getFilename = function(prefix, extension) {
	casper.log('[getFilename] Building filename with prefix="'+prefix+'" and extension="'+extension+'"','debug')
	var path = './' 
	var query = "arroz"

    var now = dateFormat(new Date(), 'yyyymmddHHMM');
    // var filename = path+'coleta.' + query + '.'+ start_as_str + '.' + prefix + '.' + now + '.' + extension
    var filename = prefix+".google-search." + extension 

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

var capturePage = function() {
    casper.log('[capturePage] start');
    casper.capture(getFilename('capture','png'));
    casper.log('[capturePage] end');
}

var logWaitForTimeout = function(timeout, details) {
    casper.echo(sprintf('Waitfor timeout. timeout=%d details=%s', timeout, details),'error');
    casper.log(sprintf('Waitfor timeout. timeout=%d details=%s', timeout, details),'error');
    
    for(p in details) {
        casper.log(sprintf('  %s=%s',p,details[p]) , 'error')
    }

    saveHtmlPage('timeout');
    capturePage();

    casper.exit();

}

var casper = require('casper').create({
	verbose: true,
	logLevel: 'debug',
	waitTimeout: 10000,
	// clientScripts: ["libs/jquery.min.js"],
	// userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5)'
	//' AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
	viewportSize: {
        width: 1920,
        height: 1080
    }
});

casper.on('waitFor.timeout', logWaitForTimeout);
// casper.on('waitFor.timeout', function(d,a) { 
// 	casper.echo("PAAAAUUUUU") ;
// 	casper.capture('timeout.png');
// 	// saveHtmlPage();

// 	// casper.echo(casper.getHTML());

// 	casper.log("[saveHtmlPage] Saving HTML...",'debug');
//     var html = String(casper.getHTML()); // grab our HTML (http://casperjs.readthedocs.org/en/latest/modules/casper.html#gethtml)
//     casper.log(html,'debug');
//     // var filename = getFilename(target.replace(/[^A-z]/g, ''), 'html') ; // create a sanitized filename by removing all the non A-Z characters (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
//     var filename = getFilename('page', 'html');
//     casper.log(filename,'debug');
//     fs.write(filename, html, 'w'); // and save it to a file (https://docs.nodejitsu.com/articles/file-system/how-to-write-files-in-nodejs)
//     casper.log("[saveHtmlPage] HTML saved at " + filename,'info');
// });

// const env = require('system').env;
// const google_email = env.MY_GOOGLE_EMAIL;
// const google_passwd = env.MY_GOOGLE_PASSWD;

var loginurl = 'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin&nojavascript=1#identifier'

casper.start(loginurl, function() {
	casper.log('Login page loading...','info')
	this.capture('loginpage.png')

	casper.waitForSelector('form#gaia_loginform', function() {
		casper.log('Login page loaded','info')
		casper.log('Filling email','info')
		this.fill('form#gaia_loginform', {
			'Email':  'alegomes@gmail.com'
		}, false);
		this.capture('emailfilled.png')
		
		this.click('input#next');
		casper.log('Password page loading','info')
	
		casper.waitForSelector('form#gaia_loginform #Passwd', function() { 
			this.capture('passwordpage.png')
			casper.log('Filling password','info')

			this.fill('form#gaia_loginform', {
				'Passwd':  '!2#Pipoc@'
			}, false);
			this.capture('passwordfilled.png')

			casper.log('Signing in...','info')
			this.click('input#signIn');
		});
	});
});

casper.thenOpen('http://google.com', function() {
	
	casper.log('Loading Google Search...', 'info');
    casper.waitForSelector('form[action="/search"]', function() {
    	this.capture('googlehome.png');
    	casper.log('Google page loaded','info');

    	this.fillSelectors('form[name="f"]', {
    		'input[title="Pesquisa Google"]' : 'arroz'
    	}, true);

    	saveHtmlPage('antesdoclick')
    	// this.click('input[name="btnG"]');
    	// this.click('input[value="Pesquisa Google"]')
    	// this.clickLabel('Pesquisa Google');
    	// form action="/search"
    	this.wait(15000, function() {
       	 	this.echo("I've waited for 15 second.");
    	});
    	saveHtmlPage('depoisdoclick')

    	casper.log('Searching...','info')
    	// casper.waitForSelector('div#foot', function() {
    	casper.waitForText('Pesquisas relacionadas', function() {
    		casper.log('Results page loaded','info')
    		this.capture('resultpage.png')
    	});
    });
});



casper.run();

