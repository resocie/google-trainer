import glob
from subprocess import Popen
import sys

for files in glob.glob("input/urls-*.csv"):
    # print(files)
	for file in files.split('\n'):
		print('\n*********************************************************')
		print('Reading file',file)

		f = open(file, 'r')
		for row in f:
			url = row.strip()
			print('\n-------------------------------------------------------')
			print('[%s] Reading url %s\n' % (file,url))
			p1 = Popen(["./casperjs", "testurl.js", url])
			output = p1.communicate()[0]
			status = p1.returncode

			print('Status code',status)
			if status != 0:
				print('[%s,%s] CasperJS Failed' % (file,url))
				err = open('urlscomproblema.txt', 'a')
				err.write(url+"\n")
				err.close()
				# sys.exit('CasperJS falhou')
