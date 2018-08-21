#!/bin/bash

function wait {
	n=$RANDOM
	echo "Random number chosen: $n"
	let "n %= 3600"; 
	echo "Mod 3600: $n"
	let "m = n/60"
	echo "Divided/60: $m"

	echo "$(date '+%d/%m/%Y %H:%M:%S') Sleeping now for $m min"
	sleep $n
	echo $(date '+%d/%m/%Y %H:%M:%S')" Waking up after $m min of sleeping"
}

function train {
	echo
	echo
	echo "***************************************************"
	echo "$(date '+%d/%m/%Y %H:%M:%S') Starting new training"
	echo "***************************************************"

	python train.py
	local status=$?
    if [ $status -ne 0 ]; then
    	echo
    	echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        echo "!!!!!!!!! TRAINING FAILED !!!!!!!!!"
        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        exit -1
    fi
	echo
	echo


	# echo "MacOS or Linux?"
	# OS=$(uname)
	# if [[ "$OS" == "Darwin" ]]; then
	# 	echo "MacOS detected."
	# 	FINDOPTS="-s"
	# elif [[ "$OS" == "Linux" ]]; then
	# 	echo "Linux detected."
	# 	FINDOPTS=""
	# fi

	# echo
	# echo "Packing stuff now..."
	# echo
	# DIR=$(find $FINDOPTS output -type d | tail -1 | cut -d '/' -f2)
	# TIMESTAMP=$(echo $DIR | cut -d- -f1)
	# cd output
	# zip -r $DIR.zip $DIR $LOGFILE $TIMESTAMP*.txt			
	# cd ..

	# DATADIR="/Users/alegomes/GDrive/2018/unb/ipol/resocie/projetos/eleicoes 2018/obm/data/2. training"/

	# echo "Moving output/$DIR.zip to $DATADIR"
	# mv output/$DIR.zip "$DATADIR"
	# echo "Moving ../$LOGFILE to $DATADIR/logs"
	# mv ../$LOGFILE "$DATADIR/logs"
	# echo "Moving $TIMESTAMP*.txt to $DATADIR/logs"
	# mv $TIMESTAMP*.txt "$DATADIR/logs"

	# echo "Removing $DIR"
	# rm -rf $DIR

	wait
}

LOGFILE=$(date +%Y%m%d%H%M)-screen.txt

while(true); do 
	train | tee -a output/$LOGFILE 
done
