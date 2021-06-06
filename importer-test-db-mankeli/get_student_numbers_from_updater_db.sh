#!/bin/sh
echo "Getting studentnumbers for new msc programs"
docker exec db_sis psql -U postgres db_sis_real -c \
"SELECT studentnumber FROM studyright_elements WHERE startdate > '2017-07-31 \
00:00:00+00' AND code LIKE '%MH%';" > msc_students.txt 

echo "Getting studentnumbers for new bsc programs"
docker exec db_sis psql -U postgres db_sis_real -c \
"SELECT studentnumber FROM studyright_elements WHERE startdate > '2017-07-31 \
00:00:00+00' AND code LIKE '%KH%';" > bsc_students.txt 

echo "Getting studentnumbers for doctoral and old programs"
docker exec db_sis psql -U postgres db_sis_real -c \
"SELECT studentnumber FROM studyright_elements WHERE startdate > '2017-07-30 \
00:00:00+00' AND code NOT LIKE '%KH%' AND code NOT LIKE '%MH%';" > other_students.txt
