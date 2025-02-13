#!/bin/bash

ROOT_DIR=$(pwd)

# Find and delete all node_modules except the one in the root directory
find . -type d -name "node_modules" -not -path "./node_modules" | while read -r dir; do
    echo "Removing: $dir"
    rm -rf "$dir"
done

echo "Done!"
