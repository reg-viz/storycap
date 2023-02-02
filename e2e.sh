#!/bin/bash

set -e

function run() {
  pushd $1
  echo "Start $1"
  yarn --pure-lockfile
  yarn clear
  yarn storycap:all
  img_count=$(find __screenshots__ -name "*.png" | wc -l)
  if [ "$img_count" -eq 0 ]; then
    echo "Test was failed. There is no capture..."
    popd > /dev/null
    exit 1
  fi
  mv __screenshots__ ../../__screenshots__/$1
  popd > /dev/null
  echo "Success $1"
  echo ""
}

total=${NODE_TOTAL:-1}
current_idx=${NODE_INDEX:-0}

rm -rf __screenshots__
mkdir -p __screenshots__/examples

if [ -n "$1" ]; then
  run $1
  if [ "$?" -gt 0 ]; then
    exit 1
  fi
else
  i=0
  for x in $(ls examples); do
    if [ "$(expr $i % $total)"  -eq "$current_idx" ]; then
      run examples/${x}
      if [ "$?" -gt 0 ]; then
        exit 1
      fi
    fi
    i=$(expr $i + 1)
  done
fi

echo "E2E test was ended successfully 🎉"
