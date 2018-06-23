#!/bin/bash

TIMESTAMP=$(date +%Y%m%d%H%M)-takeout
./casperjs takeout.js $TIMESTAMP resocie.direita@gmail.com Tarrow2016 direita
./casperjs takeout.js $TIMESTAMP resocie.esquerda@gmail.com Tarrow2016 esquerda
./casperjs takeout.js $TIMESTAMP resocie.homem@gmail.com Tarrow2016 homem
./casperjs takeout.js $TIMESTAMP resocie.mulher@gmail.com Tarrow2016 mulher