#!/bin/bash

new_version() {
  # Split the current version file into major, minor and revisions
  version=$(cat VERSION)
  curr_major=$(cut -d'.' -f1 <<<$version)
  curr_minor=$(cut -d'.' -f2 <<<$version)
  curr_revision=$(cut -d'.' -f3 <<<$version)

  # Upgrade the argued portion of the version
  if [ "$1" == "major" ]; then
    curr_major=$(($curr_major + 1))
    curr_minor="0"
    curr_revision="0"
  elif [ "$1" == "minor" ]; then
    curr_minor=$(($curr_minor + 1))
    curr_revision="0"
  elif [ "$1" == "revision" ]; then
    curr_revision=$(($curr_revision + 1))
  else
    echo "Invalid version type to upgrade."
    exit 1
  fi

  echo "$curr_major.$curr_minor.$curr_revision"
}

version_file() {
  # Log the new version update and edit VERSION file
  echo "Upgraded from $(cat VERSION) -> $1"
  echo $1 > VERSION
}

docker_image() {
  # Rebuild the Docker image with the next version and push them
  imageid=$(docker images -q mcallens/uo-discordbot:latest)
  if [ "$imageid" != "" ]; then
    docker rmi $imageid --force
  fi

  if [ "$2" == "major" ] || [ "$2" == "minor" ]; then
    build_args="--build-arg ANNOUNCE=true"
  else
    build_args="--build-arg ANNOUNCE=false"
  fi

  docker build $build_args --rm -f Dockerfile -t mcallens/uo-discordbot:$1 .
  docker tag mcallens/uo-discordbot:$1 mcallens/uo-discordbot:latest
  docker push mcallens/uo-discordbot:$1
  docker push mcallens/uo-discordbot:latest
}

git_tag() {
  # Add a tag for the new version on the git repository
  git tag -a "v$1"
}

next=$(new_version "$1")
if [[ "$next" != *"Invalid"* ]]; then
  version_file $next
  docker_image $next $1

  if [ "$1" == "major" ] || [ "$1" == "minor" ]; then
    git_tag $next
  fi
fi
