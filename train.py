import sys
import csv
import os
# from subprocess import call
from subprocess import Popen, PIPE, STDOUT
import datetime

now = datetime.datetime.strftime(datetime.datetime.now(), '%Y%m%d%H%M')
folder = now + '-training'


users_filename = 'input/users-prod.csv'
f = open(users_filename, 'r')

print('Reading %s file' % users_filename)
users_reader = csv.reader(open(users_filename))
for row in users_reader:
	print("------------------------------------------------")
	print('Reading next user in %s: %s' % (users_filename,row))
	email = row[0]
	passwd = row[1]
	alias = row[2]

	queries = ""
	queries_filename = 'input/queries-%s.csv' % alias 
	queries_reader = csv.reader(open(queries_filename))
	print('Reading %s file' % queries_filename)
	for query_row in queries_reader:
		query = query_row[0]
		# print(query)
		if queries:
			queries = queries + "," + query 
		else:
			queries = query 


	urls = ""
	urls_filename = 'input/urls-%s.csv' % alias 
	urls_reader = csv.reader(open(urls_filename))
	print('Reading %s file' % urls_filename)
	for url_row in urls_reader:
		url = url_row[0]
		# print(url)
		if urls:
			urls = urls + "," + url
		else:
			urls = url


	# print("\n\n")
	print("\n[%s] Starting training of %s" % (now,alias))
	print("")

	print('Terms to be Googled: %s\n' % queries)
	print('URLs to be visited: %s\n' % urls)

	casper_cmd = "./casperjs train.js %s %s %s %s %s %s" % (folder, email, passwd, alias, queries, urls)
	casper_logfile = "output/%s-treinamento.%s.output.txt" % (now,alias)
	print('Calling CasperJS script to emulate browser navigation...')
	print('Check file %s for details' % casper_logfile)
	print('Here is the command about to be executed:\n')
	print('$ %s\n' % casper_cmd)

	sys.stdout.flush()

	# call(["./casperjs", "train.js", folder, email, passwd, alias, queries, urls, "| tee -a", "output/treinamento.$(date +%Y%m%d%H%M).output.txt"])

	# p = Popen(["./casperjs", "train.js", folder, email, passwd, alias, queries, urls], stdin=PIPE, stdout=PIPE, stderr=PIPE)
	# # output, err = p.communicate(b"input data that is passed to subprocess' stdin")
	# output, err = p.communicate()
	# rc = p.returncode



	p1 = Popen(["./casperjs", "train.js", folder, email, passwd, alias, queries, urls], stdout=PIPE)
	p2 = Popen(["tee", casper_logfile], stdin=p1.stdout)
	p1.stdout.close()  # Allow p1 to receive a SIGPIPE if p2 exits.
	output = p2.communicate()[0]
	status = p2.returncode

	print('Status code',status)
	if status != 0:
		print('CasperJS Failed')
		sys.exit('CasperJS falhou')



	# os.system("cd output; zip %s-training.zip %s-training/*; cd .." % (now,now))
	print("[%s] Finishing %s's training\n\n" % (now,alias))

	# outfile = open("output/%s/treinamento.%s.%s.output.txt" % (folder,alias,now))
	# outfile.write(output)
	# outfile.flush()
	# outfile.close()

	# errfile = open("output/%s/treinamento.%s.%s.errors.txt" % (folder,alias,now))
	# errfile.write(err)
	# errfile.flush()
	# errfile.close()

