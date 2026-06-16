#!/usr/bin/bash

URL=https://github.com/TiJ-code/GNOME-workspace-extension.git
CLONE_DIR="___git_GNOME-workspace-extension.git"

echo "Cloning repository $URL"
mkdir "$CLONE_DIR"
git clone "$URL" "$CLONE_DIR"
cd "$CLONE_DIR"

UUID=$(jq -r '.uuid' metadata.json)

echo "Installing GNOME extension $UUID"

EXT_DIR="~/.local/share/gnome-shell/extensions/$UUID"

rm -fr "$EXT_DIR"
mkdir -p "$EXT_DIR"
cp extension.js metadata.json "$EXT_DIR"

cd ..

rm -fr "$CLONE_DIR"

