const fs = require("fs");
// var util = require('util');
var dateFormat = require('dateformat');
// var sprintf = require('sprintf-js').sprintf
// var csv = require("csv");

// const env = require('system').env;
// const google_email = env.MY_GOOGLE_EMAIL;
// const google_passwd = env.MY_GOOGLE_PASSWD;


var getFilename = function(prefix, extension) {
	casper.log('[getFilename] Building filename with prefix="'+prefix+'" and extension="'+extension+'"','debug')

    var now = dateFormat(new Date(), 'yyyymmddHHMMss');
    // var filename = path+'coleta.' + query + '.'+ start_as_str + '.' + prefix + '.' + now + '.' + extension
    var filename =  path + "/" + now + "." + prefix + '.' + extension 

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
    var logfilename = path + 'training.'+ start_as_str + '.log';

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
	var user = email.split('@')[0]
	var qualifier = 'login.'+user

	casper.start(loginurl, function() {
		casper.log('['+user+'] Login page loading...','info')
		screenshot(qualifier+'.1loginpage')

		casper.waitForSelector('form#gaia_loginform', function() {
			casper.log('['+user+'] Login page loaded','info')
			casper.log('['+user+'] Filling email','info')
		});
	});

	casper.then(function() {
		this.fill('form#gaia_loginform', { 'Email':  email }, false);
		screenshot(qualifier+'.2emailfilled');
	});

	casper.then(function() {
		this.click('input#next');
			casper.log('['+user+'] Password page loading','info')
			casper.waitForSelector('form#gaia_loginform #Passwd', function() { 
				this.log('['+user+'] Password page loaded', 'debug');
				screenshot(qualifier+'.3passwordpage');
			});
	})

	casper.then(function() {
		this.log('['+user+'] Filling password','info')
		this.fill('form#gaia_loginform', { 'Passwd':  pass }, false);
		screenshot(qualifier+'.4passwordfilled')
	})

	casper.then(function() {
		this.log('['+user+'] Signing in...','info')
		this.click('input#signIn');
	})

	casper.then(function() {
		screenshot(qualifier+'.5loggedin');
	})

}

var searchFor = function(query) {

	casper.thenOpen('http://google.com/', function() {
		casper.log('Searching for "' + query + '"', 'info')
		this.waitForSelector('form[action="/search"]')
		screenshot('searchFor.'+query+'.googlehome')
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
    		screenshot('searchFor.'+query+'.resultpage.')
    		saveHtmlPage('searchFor.'+query+'.resultpage.')
    	});
	})

}

var visit = function(url) {
	var user = email.split('@')[0]
	casper.log('Visiting ' + url, 'info')
	casper.thenOpen(url, function() {
		screenshot('visit.'+user+'.'+url.split('//')[1].replace(/\./g,'').replace('/','|'))
	})
	casper.log(url + ' visited.')
}

var logout = function(email) {
	var user = email.split('@')[0]

	logouturl = 'https://accounts.google.com/Logout';
	casper.log('Signing out','info')
	casper.thenOpen(logouturl,function() {
		this.waitForSelector('h1#headingText')
		screenshot('logout.'+user+'.8loggedout')
	})

	casper.thenOpen('http://google.com/', function() {
		this.waitForSelector('form[action="/search"]')
		screenshot('logout.'+user+'.9googlehome')
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

// Events
casper.on('waitFor.timeout', logWaitForTimeout);
casper.on('log', logToFile, 'local');

// Args
if (! casper.cli.has(3)) {
    casper.echo('[ERROR] Argument missing. Usage:');
    casper.echo('');
    casper.echo('   $ casperjs collect.js <email> <password> <queries> <urls>');
    casper.echo('');
    casper.exit();
}

var email = casper.cli.get(0);
var pass = casper.cli.get(1);
var queries = casper.cli.get(2).split(',');
var urls = casper.cli.get(3).split(',');

casper.log('email='+email,'debug')
casper.log('pass='+pass,'debug')
casper.log('queries='+queries,'debug')
casper.log('urls='+urls,'urls')

// Working dirs
parent_dir = 'output'
if( !fs.exists(parent_dir) ) {
    fs.makeDirectory(parent_dir);
}

path = parent_dir + '/' + start_as_str + '/'
fs.makeDirectory(path);

// Data
var profiles = [
	// {
	// 	'email' : 'resocie.direita@gmail.com',
	// 	'pass' : 'Tarrow2016',
	// 	'queries' : [
	// 		'imposto zero',
	// 		'direito armas',
	// 		'pena de morte',
	// 		'ideologia de genero',
	// 		'escola sem partido',
	// 		'intervencao militar',
	// 		'marxismo cultural',
	// 		'direito a vida',
	// 		'reducao maioridade',
	// 		'prisao perpetua',
	// 		'esquerdopatas',
	// 		'petralhas',
	// 		'estado minimo',
	// 		'reducao impostos',
	// 		'ditadura venezuela',
	// 		'ditadura cuba',
	// 		'feminazi',
	// 		'lula ladrao',
	// 		'privatiza tudo',
	// 		'liberdade economica'],
	// 	'urls' : [
	// 		'http://www.facebook.com/Danilo.Gentili.Oficial/',
	// 		'http://www.tvrevolta.com/',
	// 		'http://marcosdoval.com.br/',
	// 		'http://www.contracorrupcao.org/',
	// 		'http://www.facebook.com/rachelsheherazadejornalista/',
	// 		'http://www.administradores.com.br/',
	// 		'https://mbl.org.br/',
	// 		'http://www.facebook.com/Partido-Anti-PT-1510625462536589/',
	// 		'https://vemprarua.net/',
	// 		'http://canaldootario.com.br/',
	// 		'http://www.folhapolitica.org/',
	// 		'http://www.infomoney.com.br/',
	// 		'http://familiaalegriacanaverde.blogspot.com/',
	// 		'http://www.facebook.com/admRachelSheherazade/',
	// 		'http://coroneltelhada.com.br/',
	// 		'https://www.implicante.org/',
	// 		'https://www.empiricus.com.br/',
	// 		'http://www.maconsbr.com.br/',
	// 		'http://queromedefender.wixsite.com/queromedefender',
	// 		'http://www.endireitabrasil.com.br/',
	// 		'http://www.socialistadeiphone.com/',
	// 		'https://www.oantagonista.com/',
	// 		'http://orgulhohetero.blog.br/',
	// 		'http://www.olavodecarvalho.org/',
	// 		'http://www3.redetv.uol.com.br/blog/reinaldo/',
	// 		'http://occalertabrasil.blogspot.com/',
	// 		'https://republicadecuritibaonline.com/',
	// 		'http://orgulhohetero.blog.br/',
	// 		'https://www.mises.org.br/',
	// 		'http://lobao.com.br/',
	// 		'http://www.ilisp.org/',
	// 		'http://somosodireita.blogspot.com/',
	// 		'https://www.internautascristaos.com/',
	// 		'https://sarawinter.com.br/',
	// 		'http://tradutoresdedireita.org/',]
	// },
	// {
	// 	'email' : 'resocie.esquerda@gmail.com',
	// 	'pass' : 'Tarrow2016',
	// 	'queries' : [
	// 		'lula livre',
	// 		'reforma agraria',
	// 		'direito a moradia',
	// 		'passe livre',
	// 		'diretas ja',
	// 		'fora temer',
	// 		'volta dilma',
	// 		'coracao valente',
	// 		'quem matou marielle franco?',
	// 		'legalizacao do aborto',
	// 		'socialismo',
	// 		'feminismo',
	// 		'pre-sal e nosso',
	// 		'discriminalizacao das drogas',
	// 		'laicidade do Estado',
	// 		'anula STF',
	// 		'luta contra o racismo',
	// 		'contra o golpismo',
	// 		'defesa da universidade publica',
	// 		'lute como uma menina'],
	// 	'urls' : [
	// 		'https://jovensdeesquerda.wordpress.com/',
	// 		'http://www.facebook.com/ticosantacruz/',
	// 		'http://www.facebook.com/MemesMessianicos/',
	// 		'https://www.conversaafiada.com.br/pig',
	// 		'http://www.facebook.com/Brasil247/',
	// 		'http://www.facebook.com/antialienacaomental/',
	// 		'http://www.facebook.com/Falandoverdadesbr2/',
	// 		'http://www.facebook.com/guerrilheirosvirtuais/',
	// 		'http://www.facebook.com/PedalaDireita/',
	// 		'http://www.tijolaco.com.br/blog/',
	// 		'http://www.facebook.com/HistoriasDaEsquerda/',
	// 		'http://vermelho.org.br/',
	// 		'http://www.mabnacional.org.br/',
	// 		'http://www.facebook.com/DilmaResistente/',
	// 		'http://www.facebook.com/PragmatismoPolitico/',
	// 		'http://www.pragmatismopolitico.com.br/',
	// 		'http://www.plantaobrasil.net/',
	// 		'http://compartilhe13.blogspot.com/',
	// 		'http://territoriolivre.org/',
	// 		'http://www.mtst.org/',
	// 		'https://www.revistaforum.com.br/',
	// 		'http://petistasdecoracao.blogspot.com/2015/10/petistas-de-coracao.html',
	// 		'https://www.thinkolga.com/',
	// 		'https://feminismosemdemagogia.wordpress.com/',
	// 		'http://www.empodereduasmulheres.com/',
	// 		'https://www.viomundo.com.br/',
	// 		'https://www.esquerda.net/',
	// 		'http://dilma.com.br/',
	// 		'https://www.cut.org.br/',
	// 		'http://brasildebate.com.br/',
	// 		'http://www.une.org.br/',
	// 		'http://movimientospopulares.org/',
	// 		'https://www.facebook.com/eremitadeesquerda/',
	// 		'https://www.facebook.com/CamaradaComunista/',
	// 		'https://www.facebook.com/VerdadeSemManipulacao/',]
	// },
	// {
	// 	'email' : 'resocie.homem@gmail.com',
	// 	'pass' : 'Tarrow2016',
	// 	'queries' : [
	// 		'como fazer churrasco',
	// 		'tabela brasileirão',
	// 		'como dar um no de gravata?',
	// 		'roupas masculinas',
	// 		'câncer de próstata',
	// 		'saúde masculina',
	// 		'impotência sexual',
	// 		'viagra',
	// 		'paternidade',
	// 		'acessórios masculinos',
	// 		'ejaculação precoce'],
	// 	'urls' : [
	// 		'https://www.facebook.com/churrasqueadasoficial/',
	// 		'https://www.facebook.com/RevistaAutoesporte/',
	// 		'https://www.facebook.com/RevistaPlacar/',
	// 		'https://www.facebook.com/autoesportetv/',
	// 		'https://www.facebook.com/AUTOVideosBrasil/',
	// 		'https://www.facebook.com/grupolance/',
	// 		'https://www.facebook.com/webmotors/',
	// 		'https://www.facebook.com/BRShoploja/',
	// 		'https://www.facebook.com/cartolafc/',
	// 		'https://www.facebook.com/NitroCircusPOR/',
	// 		'https://www.webmotors.com.br/',
	// 		'https://www.lojasrenner.com.br/c/masculino/-/N-1xeiyoy/p1',
	// 		'https://www.kanui.com.br/roupas-masculinas/',
	// 		'https://www.dafiti.com.br/roupas-masculinas/',]
	// },
	// {
	// 	'email' : 'resocie.mulher@gmail.com',
	// 	'pass' : 'Tarrow2016',
	// 	'queries' : [
	// 		'como amamentar?',
	// 		'roupas femininas',
	// 		'sintomas de menopausa',
	// 		'tensão pré-menstrual',
	// 		'cólica menstrual',
	// 		'maternidade',
	// 		'depressão pós-parto',
	// 		'câncer de mama',
	// 		'câncer de útero',
	// 		'saúde feminina',
	// 		'acessórios femininos'],
	// 	'urls' : [
	// 		'https://www.facebook.com/panelaterapia/',
	// 		'https://www.facebook.com/roteirosdecharme/',
	// 		'https://www.facebook.com/babycombr/',
	// 		'https://www.facebook.com/bibliadamulher/',
	// 		'https://www.facebook.com/maquiadoradesucesso/',
	// 		'https://www.facebook.com/avonbr/?brand_redir=47274846623',
	// 		'https://www.facebook.com/LojaVidaeCor/',
	// 		'https://www.facebook.com/sazonbrasil/',
	// 		'https://www.facebook.com/salonline/',
	// 		'https://brasil.babycenter.com/',
	// 		'https://www.facebook.com/meumarido',
	// 		'https://www.enjoei.com.br/',
	// 		'http://www.bibliadamulher.com.br/',
	// 		'https://www.dicasdemulher.com.br/',]
	// },
	{
		'email' : 'alegomes@gmail.com',
		'pass' : '!2#Pipoc@',
		'queries' : [
			'capoeira',
			'bike',
			'dança'],
		'urls' : [
			'http://www.terra.com.br',
			'http://www.nytimes.com']
	},
	{
		'email' : 'alegomes@wso2brasil.com.br',
		'pass' : '!2#Pipoc@',
		'queries' : [
			'apim',
			'iot',
			'esb',
			'identity server'],
		'urls' : [
			'http://www.wso2.com',
			'http://www.redhat.com',
			'http://www.microsoft.com']
	}
]

// var email = 'alegomes@wso2brasil.com.br'
// var pass = '!2#Pipoc@' 
// var queries = ['apim','iot','esb']
// var urls = ['http://www.wso2.com',
// 			'http://www.redhat.com',
// 			'http://www.microsoft.com']

login(email, pass)

for(var q=0; q < queries.length; q++) {
	query = queries[q]
	casper.log('Searching for '+query,'debug')
	searchFor(queries[q]);

}

for(var u=0; u < urls.length; u++) {
	url = urls[u]
	casper.log('Visiting '+url,'debug')
	visit(url)
}

logout(email)

casper.run();

