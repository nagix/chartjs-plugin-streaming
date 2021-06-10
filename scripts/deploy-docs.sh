#!/bin/bash

set -e

source ./scripts/utils.sh

TARGET_DIR='gh-pages'
TARGET_BRANCH='gh-pages'
TARGET_REPO_URL="https://$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git"

VERSION=$(node -p -e "require('./package.json').version")
MODE=$1
TAG=$(tag_from_version "$VERSION" "$MODE")

if [ "$MODE" == "release" -a "$TAG" == "next" ]; then
  echo "Skipping deploy because this is prerelease version"
  exit 0
fi

function deploy_tagged_files {
  local tag=$1
  rm -rf $tag
  cp -r ../dist/docs $tag
}

# Clone the gh-pages branch in the repository 
git clone -b $TARGET_BRANCH $TARGET_REPO_URL $TARGET_DIR
cd $TARGET_DIR

# Copy generated documentation
deploy_tagged_files $TAG

git add --all

git remote add auth-origin $TARGET_REPO_URL
git config --global user.email "$GH_AUTH_EMAIL"
git config --global user.name "$GH_AUTH_NAME"
git commit -m "Deploy $TAG from $GITHUB_REPOSITORY" -m "Commit: $GITHUB_SHA"
git push -q auth-origin $TARGET_BRANCH
git remote rm auth-origin

# Cleanup
cd ..
rm -rf $TARGET_DIR
