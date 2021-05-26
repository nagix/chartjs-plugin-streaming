#!/bin/bash

set -e

source ./scripts/utils.sh

TARGET_DIR='gh-pages'
TARGET_BRANCH='gh-pages'
TARGET_REPO_URL="https://$GITHUB_AUTH_TOKEN@github.com/$TRAVIS_REPO_SLUG.git"

VERSION=$(get_version)
VERSION_REGEX='[[:digit:]]+.[[:digit:]]+.[[:digit:]]+(-.*)?'

# Make sure that this script is executed only for the release and master branches
if [ "$VERSION" == "" ]; then
    echo "Skipping deploy because this is not the master or release branch"
    exit 0
fi

function update_latest {
    local latest=($(ls -v | egrep '^('$VERSION_REGEX')$' | tail -1))
    if [ "$latest" == "" ]; then latest='master'; fi
    rm -f latest
    ln -s $latest latest
}

function deploy_files {
    local version=$1
    rm -rf "$version"
    cp -r ../dist/docs $version
    update_latest
}

# Clone the gh-pages branch in the repository 
git clone -b $TARGET_BRANCH $TARGET_REPO_URL $TARGET_DIR
cd $TARGET_DIR

# Copy generated documentation
deploy_files $VERSION

git add -A

git remote add auth-origin $TARGET_REPO_URL
git config --global user.email "$GITHUB_AUTH_EMAIL"
git config --global user.name "nagix"
git commit -m "Deploy $VERSION from $TRAVIS_REPO_SLUG" -m "Commit: $TRAVIS_COMMIT"
git push -q auth-origin $TARGET_BRANCH
git remote rm auth-origin

# Cleanup
cd ..
rm -rf $TARGET_DIR
