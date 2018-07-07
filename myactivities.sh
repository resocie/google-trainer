#!/bin/bash

TIMESTAMP=$(date +%Y%m%d%H%M)-myactivities
./casperjs myactivities.js $TIMESTAMP resocie.direita@gmail.com Tarrow2016 direita | tee output/${TIMESTAMP}.direita.log
./casperjs myactivities.js $TIMESTAMP resocie.esquerda@gmail.com Tarrow2016 esquerda | tee output/${TIMESTAMP}.esquerda.log
./casperjs myactivities.js $TIMESTAMP resocie.homem@gmail.com Tarrow2016 homem | tee output/${TIMESTAMP}.homem.log
./casperjs myactivities.js $TIMESTAMP resocie.mulher@gmail.com Tarrow2016 mulher | tee output/${TIMESTAMP}.mulher.log