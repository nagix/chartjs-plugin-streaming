#!/bin/bash

function get_version {
    if [ "$TRAVIS_BRANCH" =~ ^release.*$ ]; then
        # Travis executes this script from the repository root, so at the same level than package.json
        VERSION=$(node -p -e "require('./package.json').version")
        if [ "$VERSION" =~ -(alpha|beta|rc) ]; then
        	echo "next"
        else
        	echo $VERSION
        fi
    elif [ "$TRAVIS_BRANCH" == "master" ]; then
        echo "master"
    else
        echo ""
    fi
}
