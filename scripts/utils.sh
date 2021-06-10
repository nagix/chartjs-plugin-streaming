#!/bin/bash

VERSION=$(node -p -e "require('./package.json').version")

function tag_from_version {
  local version=$1
  local mode=$2
  local tag=''
  if [ "$mode" == "master" ]; then
    tag=master
  elif [[ "$version" =~ ^[^-]+$ ]]; then
    if [ "$mode" == "release" ]; then
      tag=$version
    else
      tag=latest
    fi
  else
    tag=next
  fi
  echo $tag
}
