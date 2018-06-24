import csv
# from subprocess import call
from subprocess import Popen, PIPE
import datetime

now = datetime.datetime.strftime(datetime.datetime.now(), '%Y%m%d%H%M')
folder = now + '-training'

users_filename = 'input/users-prod.csv'
# f = open('input/users-test.csv', 'r')

users_reader = csv.reader(open(users_filename))
for row in users_reader:
	print(row)
	email = row[0]
	passwd = row[1]
	alias = row[2]

	queries = ""
	queries_filename = 'input/queries-%s.csv' % alias 
	queries_reader = csv.reader(open(queries_filename))
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
	for url_row in urls_reader:
		url = url_row[0]
		# print(url)
		if urls:
			urls = urls + "," + url
		else:
			urls = url

	print(queries)
	print(urls)

	# call(["./casperjs", "train.js", folder, email, passwd, alias, queries, urls, "| tee -a", "output/treinamento.$(date +%Y%m%d%H%M).output.txt"])

	# p = Popen(["./casperjs", "train.js", folder, email, passwd, alias, queries, urls], stdin=PIPE, stdout=PIPE, stderr=PIPE)
	# # output, err = p.communicate(b"input data that is passed to subprocess' stdin")
	# output, err = p.communicate()
	# rc = p.returncode

	p1 = Popen(["./casperjs", "train.js", folder, email, passwd, alias, queries, urls], stdout=PIPE)
	p2 = Popen(["tee", "output/treinamento.%s.output.txt" % (now)], stdin=p1.stdout, stdout=PIPE)
	p1.stdout.close()  # Allow p1 to receive a SIGPIPE if p2 exits.
	output = p2.communicate()[0]

	# outfile = open("output/%s/treinamento.%s.%s.output.txt" % (folder,alias,now))
	# outfile.write(output)
	# outfile.flush()
	# outfile.close()

	# errfile = open("output/%s/treinamento.%s.%s.errors.txt" % (folder,alias,now))
	# errfile.write(err)
	# errfile.flush()
	# errfile.close()

