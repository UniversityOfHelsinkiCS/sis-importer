#!/bin/bash

# Passes all additional arguments to docker-compose as is. See ./run db up --help

option=$1

command=$2

if [[ $option == morning ]];
then
  docker-compose down --rmi all --remove-orphans --volumes
elif [[ $command == down ]];
then
  docker-compose down "${@:3}"
elif [[ $option == db ]];
then
  docker-compose "${@:2}" importer-db importer-adminer importer-db-api
elif [[ $option == ci ]];
then
  docker-compose -f ~/sis-importer/docker-compose.ci.yml "${@:2}"
else
  docker-compose "${@:1}"
fi