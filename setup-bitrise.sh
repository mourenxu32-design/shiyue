#!/bin/bash
# Bitrise Setup Script for ShiYue Project
# Automates initial Git setup and push to GitHub

set -e

echo "========================================"
echo "   ShiYue - Bitrise CI/CD Setup"
echo "========================================"
echo ""

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
else
    echo "✓ Git repository already exists"
fi

# Check remote origin
if git remote -v | grep -q origin; then
    echo "✓ Remote 'origin' already configured"
    git remote -v
else
    echo "⚠️ No remote 'origin' found"
    echo "Please run the following command (manually or via script):"
    echo "git remote add origin <your-github-repo-url>"
    exit 1
fi

# Add all new files
echo "📝 Checking for uncommitted changes..."
git status --short

if [ $(git status --short | wc -l) -gt 0 ]; then
    echo ""
    echo "📦 Adding uncommitted files..."
    git add .
fi

# Commit changes if there are any
if ! git diff --cached --quiet; then
    echo "💾 Committing changes..."
    git commit -m "Add Bitrise CI/CD configuration" || true
fi

# Push to GitHub
echo ""
echo "🔥 Pushing to GitHub..."
read -p "Press Enter to push to GitHub (main branch)..." 
git push -u origin main --force

echo ""
echo "========================================"
echo "   ✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Go to https://www.bitrise.io/"
echo "2. Sign up with GitHub"
echo "3. Click 'Start a new project'"
echo "4. Select your shiyue-app repository"
echo "5. Choose 'Generic Docker Image' stack"
echo "6. Deploy! ✓"
echo ""
