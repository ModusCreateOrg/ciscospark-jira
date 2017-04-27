#!/usr/bin/env bash

set -o allexport
. .env
. .env.local
set +o allexport

$@
