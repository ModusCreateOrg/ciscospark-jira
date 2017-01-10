#!/usr/bin/env bash

. .env
. .env.local # TODO look to see if file exists first

$@
