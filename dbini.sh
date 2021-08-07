#!/usr/bin/env bash
MYSQL_PWD=root /bin/mysql -hdb -uroot < /tmp/schema.sql

while [ $? == 1 ]
do
  sleep 5
  MYSQL_PWD=root /bin/mysql -hdb -uroot < /tmp/schema.sql
done
