#!/bin/sh

rsync -av --exclude '.*' . gingerik:/var/www/iseq
ssh gingerik 'sudo iseq-restart'
