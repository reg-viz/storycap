#!/bin/bash

run() {
  pushd $1
  rm -rf node_modules
  rm -rf __screenshots__
  yarn --pure-lockfile
  yarn screenshot --debug
  if [ "$?" -ne 0 ]; then
    echo "An error occurred ... 😢"
    popd
    exit 1
  fi
  count=$(ls __screenshots__ | wc -w)
  if [ "$count" -eq 0 ]; then
    echo "There is no PNG files... 😢"
    popd
    exit 1
  fi
  echo "✨ screenshot in $1 is ended successfully ✨"
  popd
}

run examples/react && run examples/react-storyshots run examples/angular && run examples/vue
