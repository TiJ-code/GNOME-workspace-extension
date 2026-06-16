#!/usr/bin/bash

URL=https://github.com/TiJ-code/GNOME-workspace-extension.git
CLONE_DIR="___git_GNOME-workspace-extension.git"

echo "Cloning repository $URL"
mkdir "$CLONE_DIR"
git clone "$URL" "$CLONE_DIR"
cd "$CLONE_DIR"

echo ""
echo "Installing extension"
make install

echo ""
echo "Logging out..."
gnome-session-quit

