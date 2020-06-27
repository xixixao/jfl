#!/bin/bash

# npx does all sorts of nasty stuff (like installing modules globally),
# we just want to execute the command or prompt people to run `npm install`

if test "$#" -lt 1; then
  echo "$0: Missing argument (a command from \`node_modules/.bin\` to execute)"
  exit 1
fi

executable="$(dirname "$0")/../node_modules/.bin/$1"
if test -f "$executable"; then
  "$executable" "${@:2}"
else
  echo "`$1` could not be found in `node_modules/.bin`, have you run `npm install`?"
fi
