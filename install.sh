#!/usr/bin/bash

UUID=$(jq -r '.uuid' metadata.json)

echo "Installing GNOME extension $UUID"

EXT_DIR = ~/.local/share/gnome-shell/extensions/$(UUID)

rm -fr "$EXT_DIR"
mkdir -p "$EXT_DIR"
cp extension.js metadata.json "$EXT_DIR"

