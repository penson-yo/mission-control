#!/bin/bash
# Auto-pull script - run before starting work
# Usage: ./git-pull.sh

cd "$(dirname "$0")"

echo "Pulling latest changes..."
git pull

if [ $? -eq 0 ]; then
    echo "✅ Pull successful!"
    npm install 2>/dev/null
else
    echo "❌ Pull failed"
fi
