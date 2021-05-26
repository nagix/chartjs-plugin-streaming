#!/bin/bash

set -e

source ./scripts/utils.sh

VERSION=$(get_version)

sed -i -e "s/VERSION/$VERSION/g" "docs/.vuepress/config.js"
