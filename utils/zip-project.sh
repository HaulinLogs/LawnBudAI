#!/bin/bash
ZIP_NAME="lawnbudai.zip"

# Get the list of included files
FILES=$(git ls-files --others --cached --exclude-standard)

# Zip them up
zip -r "$ZIP_NAME" $FILES
echo "Created $ZIP_NAME"
