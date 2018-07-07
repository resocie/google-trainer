#!/bin/bash

echo
echo
echo "***************************************************"
echo "$(date '+%d/%m/%Y %H:%M:%S') Starting new training"
echo "***************************************************"
echo
echo
python train.py
echo
echo

echo
echo "Packing stuff now..."
echo
DIR=$(find -s output -type d | tail -1 | cut -d '/' -f2)
cd output
zip -r $DIR.zip $DIR
cd ..

echo "$(date '+%d/%m/%Y %H:%M:%S') Sleeping now for 30 min"
sleep 1800
