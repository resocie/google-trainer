var casper = require('casper').create({
	verbose: true,
	logLevel: 'info',
	waitTimeout: 10000,
	// clientScripts: ["libs/jquery.min.js"],
	// userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5)'
	//' AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
	viewportSize: {
        width: 1920,
        height: 1080
    }
});

// const env = require('system').env;
// const google_email = env.MY_GOOGLE_EMAIL;
// const google_passwd = env.MY_GOOGLE_PASSWD;

var loginurl = 'https://accounts.google.com/ServiceLogin?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin&nojavascript=1#identifier'

casper.start(loginurl, function() {
	casper.log('Login page loading...','info')
	this.capture('loginpage.png')

	casper.waitForSelector('form#gaia_loginform', function() {
		casper.log('Login page loaded','info')
		casper.log('Filling email')
		this.fill('form#gaia_loginform', {
			'Email':  'alegomes@gmail.com'
		}, false);
		this.capture('emailfilled.png')
		
		this.click('input#next');
		casper.log('Password page loading')
	
		casper.waitForSelector('form#gaia_loginform #Passwd', function() { //div#forgotPassword
			this.capture('passwordpage.png')
			casper.log('Filling password')

			this.fill('form#gaia_loginform', {
				'Passwd':  '!2#Pipoc@'
			}, false);
			this.capture('passwordfilled.png')

			casper.log('Signing in...')
			this.click('input#signIn');
		});
	});
});




casper.run();

