#!/bin/bash

# Auto-commit script for MOM Generator
# This script watches for file changes and auto-commits them

echo "🔄 Auto-commit watcher started..."
echo "📝 Watching for changes in: $(pwd)"
echo "Press Ctrl+C to stop"
echo ""

# Initial commit if there are changes
if [[ -n $(git status -s) ]]; then
    echo "📦 Found uncommitted changes, committing..."
    git add -A
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "🚀 Triggering Netlify deployment..."
    ./check-deploy.sh --watch &
fi

# Watch for changes using fswatch (macOS)
if command -v fswatch &> /dev/null; then
    fswatch -o --exclude='.git' . | while read change; do
        if [[ -n $(git status -s) ]]; then
            echo "🔔 Changes detected at $(date '+%H:%M:%S')"
            git add -A
            git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
            echo "✅ Changes committed and pushed"
            echo "🚀 Netlify deployment triggered, monitoring..."
            ./check-deploy.sh --watch &
            echo ""
        fi
    done
else
    echo "⚠️  fswatch not found. Install it with: brew install fswatch"
    echo ""
    echo "Alternative: Use this command manually when you want to commit:"
    echo "git add -A && git commit -m 'Update' && git push origin main"
fi
