#!/bin/bash

set -e

source ./scripts/utils.sh

VERSION=$(node -p -e "require('./package.json').version")
MODE=$1
TAG=$(tag_from_version "$VERSION" "$MODE")

sed -i -e "s/\"VERSION\"/\"$TAG\"/g" "docs/.vuepress/config.js"
