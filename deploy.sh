#!/bin/bash

if [ $# -lt 1 ] ; then
  target="/var/www/html/jslash"
else
  target=$1
fi

if [ $# -lt 2 ] ; then
  command="sudo rsync -avu --exclude=.* . $target"
elif [ $2 = "--noroot" ] ; then
  command="rsync -avu --exclude=.* . $target"
fi 

echo "$command"

$command

echo $r
